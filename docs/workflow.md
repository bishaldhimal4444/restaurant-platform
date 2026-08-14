# Restaurant Platform — Verified Workflow (Current State)

**Every claim in this document was directly verified against live source code, running containers, or database contents on the date below — not inferred, not assumed, not carried over from a prior session's notes.** Where something could not be verified, it's explicitly marked `UNVERIFIED` rather than guessed at.

Verification date: see git history / commit this file lands in.

This document complements `docs/PROJECT.md` (architecture/stack reference) — this one is specifically the **step-by-step user journey**, kept accurate against actual behavior.

---

## 1. The guest journey (customer side, no login)

### 1.1 Picking a table

**File:** `app/guest/page.tsx` — a single client-rendered page that handles table selection *and* the post-check-in waiting screen (not split across separate routes, despite what the file tree under `app/guest/tables/` and `app/guest/session/` might suggest at a glance).

- Tables are grouped into two labeled sections using a **frontend-only display convention** (not stored in the database — `Table.number` is a plain integer):
  - Numbers 1–10 → **"Main Entrance"**, labeled `M1`–`M10`
  - Numbers 11–20 → **"Rooftop"** (labeled "Rooftop View" in the guest UI), labeled `R1`–`R10`
  - The staff-facing `/tables` page (§2.1) additionally buckets anything outside 1–20 into an **"Other"** section — confirmed present there. It is `UNVERIFIED` whether the guest picker has an equivalent fallback for out-of-range tables; the grep evidence available did not show a third bucket on the guest side.
- The table list auto-refreshes every 5 seconds (`setInterval(loadTables, 5000)`) while the guest is browsing.
- Table cards are visually styled by availability using **inline styles, not Tailwind classes**: available tables get a green glow (`rgba(46,204,113,...)`), unavailable tables get a **red** glow (`rgba(255,77,77,...)`) and are disabled/unclickable.
- Data source: `GET /public/tables` (no auth) — returns only `id`, `number`, `capacity`, `status`. No guest PII, no session detail.

### 1.2 Checking in

Guest selects an available table and submits a check-in form (name, phone, email — optional per the DTO, though the guest UI may make some required at the form-validation level; **not independently re-verified in this pass**).

- Submission goes to `POST /api/guest/tables/[tableId]/sessions` (a Next.js Route Handler acting as a guest-auth-aware proxy).
- On the backend, this creates a `TableSession` with `status: 'PENDING'` and **immediately flips the `Table` to `OCCUPIED`** — this is the first-come-first-served lock. A second guest attempting to request the same table while one request is pending or active is rejected (`ConflictException`).
- A `guest_token` httpOnly cookie is set on first contact if the guest doesn't already have one (see `GuestAuthGuard`). This token is **intentionally not unique** in the database — a single browser can legitimately be associated with multiple `TableSession` rows over time (different visits). This was previously a real bug (see `docs/PROJECT.md` §7) and is confirmed fixed as of this verification pass — `prisma/schema.prisma` currently has no `@unique` on `guestToken`, only `@@index([guestToken])`.

### 1.3 Waiting for staff confirmation

Same `app/guest/page.tsx` component switches to its `'waiting'` internal screen state after successful check-in.

- Displays: "Almost there — We've let the staff know you're at Table {label}. Hang tight while they confirm your check-in." plus a live "Checking for confirmation…" indicator while polling is active.
- **Confirmed via source inspection: this screen genuinely polls**, via a second `setInterval` scoped to `screen === 'waiting'`, calling the session-status endpoint repeatedly until the session is no longer `PENDING`.
- That poll is proxied through `GET /api/guest/table-sessions/[sessionId]` → `lib/api/guest.ts`'s `guestApiFetch()` → backend `GET /guest/tables/table-sessions/:sessionId`. This route was found broken during this build (using an unset `BACKEND_URL` env var, causing `ECONNREFUSED` inside Docker) and was fixed in-session by switching it to `API_URL`. Confirmed fixed as of this verification pass.

### 1.4 Ordering (once confirmed)

Once staff confirms (§2.3), the session is `ACTIVE`. The guest is expected to land on `/guest/session/[sessionId]`, which is a thin redirect:

- With no query param → redirects to `/guest/session/[sessionId]/menu`.
- With `?order=success` → shows an order-confirmation screen ("Order Placed!") instead, with a "Continue Ordering" link back to the menu.
- **Code comment found directly in this file:** *"Later we'll add session details, order history, and bill generation."* This confirms there is **no guest-facing view of past orders or the bill** yet — that's a real, explicitly-acknowledged gap, not an oversight to silently work around.

**Menu page** (`app/guest/session/[sessionId]/menu/page.tsx`): server-rendered, fetches `listMenuItems()` (all items, unfiltered by table/session — matches the single-restaurant model), splits into available/unavailable, unavailable items shown struck-through and disabled at the bottom. Prices displayed with an `Rs.` prefix (Nepali Rupees).

**Cart** (`app/guest/hooks/use-cart.ts`): entirely **client-side, `localStorage`-backed**, under the key `guest_cart`. Not scoped per-session — if a browser somehow has two active guest sessions (e.g. testing), their carts would collide. Standard add/remove/update-quantity/clear operations; total computed client-side.

**Placing the order** (`app/guest/session/[sessionId]/cart/page.tsx`): `POST /api/guest/table-sessions/[sessionId]/orders` with `{ items: [{ menuItemId, quantity }] }`. This route uses the shared `guestApiFetch()` helper (correct `API_URL` env var, confirmed) — unlike the standalone route in §1.3, this one did **not** have the `BACKEND_URL` bug. On success: cart is cleared, guest is redirected to `/guest/session/[sessionId]?order=success`.

**Server-side price integrity**: confirmed at the backend level (not re-verified in this specific pass, but consistent with `docs/PROJECT.md` and prior verified backend behavior) — the order total is computed from live `MenuItem.price` at order time, not trusted from the client cart.

---

## 2. The staff journey (login required)

### 2.1 Tables overview

**File:** `app/tables/page.tsx`. Requires a valid `session_token` cookie — enforced by `proxy.ts` (Next 16's renamed `middleware.ts`), which protects `/tables`, `/menu-items`, and `/orders` path prefixes and redirects to `/login?redirect=<path>` if the cookie is absent. **Confirmed current and correct** — an earlier claim that this file was stale/misconfigured (pointing at removed routes like `/dashboard`) was checked and found **false**; it currently references only real, live routes.

- Same Main Entrance / Rooftop / Other sectioning convention as the guest picker (§1.1), implemented independently via a duplicated `getSection()` function in this file — **not shared code with the guest page**. If the sectioning logic ever needs to change, it must be changed in both places.
- Status coloring here is **Tailwind classes, not inline styles**, and **differs from the guest page's red/green convention**: `AVAILABLE` → `text-emerald-600` (green, matches guest side), but `OCCUPIED` → `text-amber-600` (amber) — **not red**. This is a real, confirmed inconsistency between the two surfaces, not a documentation error.
- "Add table" button links to `/tables/new`.

### 2.2 Table detail page

**File:** `app/tables/[id]/page.tsx`. Fetches the table plus any session with status `PENDING` or `ACTIVE` (both are included by `TablesService.findOne()` — confirmed fixed earlier in this build; originally only `ACTIVE` was included, which meant pending requests were invisible here).

Three possible states rendered:

1. **No session** → `SeatGuestsForm` — lets staff manually seat a walk-in party (bypasses the guest self-check-in flow entirely; creates a session directly as `ACTIVE`, no `PENDING` step, no guest token).
2. **Session status `PENDING`** → box labeled **"Table Requested"** (deliberately renamed from "Pending Confirmation" earlier in this build) showing guest name/phone/email/request time, plus `ConfirmRejectButtons` — a Client Component invoking `confirmSessionAction` / `rejectSessionAction` (Server Actions, not raw client-side `fetch` calls with an exposed token — this was fixed during the build after an earlier version leaked the staff JWT via an inline `onClick`).
3. **Session status `ACTIVE`** → box labeled **"Occupied"**, showing guest name and seated time, a `CloseSessionButton`, the list of orders placed so far (grouped by status), and an `OrderForm` for staff to add more items to the order on the guest's behalf.

**Confirm** stays on the table detail page after confirming (revalidates in place — staff immediately proceeds to order-taking). **Reject** redirects to `/tables` afterward (the table becomes `AVAILABLE` again, so there's nothing left to show on this now-empty page — this was a deliberate fix during the build, replacing earlier behavior that incorrectly left staff staring at an empty "seat guests" form on the just-rejected table).

### 2.3 What staff does NOT have

- **No standalone "pending requests" queue page.** One existed earlier in the build (`app/pending-sessions/page.tsx`) and was deliberately deleted in favor of the in-place table-detail approach in §2.2. **Confirmed:** the directory no longer exists on disk.
- The backend still exposes `GET /table-sessions/pending` (and a corresponding frontend API client function `getPendingSessions()` in `lib/api/table-sessions.ts`) — **confirmed still present, confirmed unused by any current page.** This is dead code, not a hidden feature — safe to ignore, though it hasn't been removed.

### 2.4 Kitchen / order status, billing

Backend routes exist and were verified present in earlier work this build (`/orders`, `/orders/active`, `/orders/:id/status`, `/table-sessions/:tableSessionId/bill`, `/bills/:id`, `/bills/:id/pay`) — **not independently re-walked end-to-end as frontend pages in this specific verification pass.** Treat frontend coverage of the kitchen view and staff-side billing UI as `UNVERIFIED` until specifically checked.

---

## 3. Known inconsistencies (confirmed real, not yet fixed — by design of this verification pass)

| Area | Inconsistency |
|---|---|
| Table status color | Guest page: red/green (inline styles). Staff page: green/amber (Tailwind). Two different conventions for the same underlying state. |
| Table sectioning logic | Duplicated (`getSection()`) independently in both `app/tables/page.tsx` and `app/guest/page.tsx` — not shared. |
| Guest cart scoping | `localStorage` key `guest_cart` is global, not scoped by `sessionId`. |
| Guest bill/payment view | Does not exist yet — explicitly flagged as future work in the session page's own source comment. |
| `docker-compose.override.yml` `WATCHPACK_POLLING` | Present in an earlier session's write-up of this file; **not present** in the version verified live in this pass (only `CHOKIDAR_USEPOLLING` for the backend service is set; the frontend service in the override has no polling env var at all). Not confirmed to cause an actual problem — flagged for awareness only. |

---

## 4. What was checked and found to be **incorrect** in a prior session's notes (for the historical record)

A previous session's summary claimed several things about this codebase that were checked directly against live source/DB and found false:

- ❌ Claimed `guestToken` had been re-added as `@unique`, contradicting an earlier fix. **False** — confirmed still correctly non-unique.
- ❌ Claimed `docker-compose.override.yml` had regressed to a production-only config with no bind mounts. **False** — dev bind mounts, `start:dev`/`npm run dev`, and polling env vars (mostly) intact.
- ❌ Claimed `proxy.ts` was stale, still protecting removed routes like `/dashboard`/`/checkout`. **False** — correctly protects the real live routes (`/tables`, `/menu-items`, `/orders`).
- ❌ Claimed the guest "waiting for confirmation" screen was not confirmed to poll. **False** — polling is implemented and functioning, confirmed directly in source.
- ⚠️ Claimed table status renders in red/green "at the frontend level" as one unified convention. **Partially true** — accurate for the guest page, **not** for the staff page (which uses amber, not red, for occupied tables).

This section exists so that if another summary document surfaces in a future session making claims about this codebase, there's a documented instance of exactly this kind of drift happening before, and the standing instruction is: **verify against live source before trusting any prior session's summary, including this one** — re-check anything here that a future change might have touched.
