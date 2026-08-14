# Restaurant Platform — Project Reference

This document is the single source of truth for what this application is, how it's built, and how its pieces fit together. Read this first in any new session before making changes — it exists specifically to keep context consistent across many separate AI-assisted coding sessions ("vibe coding").

**Keep this file up to date.** Whenever a structural decision changes (new module, renamed route, schema change, new convention), update the relevant section here in the same session.

---

## 1. What this application is

A **single-restaurant, dine-in table management system** — not a multi-restaurant marketplace. There is exactly one `Restaurant` record in the database. The people who use this system fall into two groups:

- **Staff** (`OWNER` / `ADMIN` roles) — log in with email/password, manage tables, the menu, confirm or reject guest requests, take orders, run the kitchen workflow, and handle billing.
- **Guests** (customers) — no account, no login. They scan a QR code or visit a table's URL, request that table, wait for staff confirmation, then (once seated) can browse the menu and place orders from their own device.

### Core workflow (the golden path)

1. Staff creates the restaurant record (once) and adds tables.
2. A guest visits the app, picks their table, and submits their name/phone/email — this creates a `TableSession` with status `PENDING` and immediately marks the `Table` as `OCCUPIED` (reserving it so no one else can request the same table).
3. Staff sees the pending request directly on that table's detail page (guest name + Confirm/Reject buttons — **not** a separate global "pending requests" list; this was deliberately removed in favor of showing it in-place).
4. Staff **confirms** → session becomes `ACTIVE`, guest can now order. Staff **rejects** → session becomes `CLOSED`, table becomes `AVAILABLE` again, staff is returned to the tables list.
5. Guest (or staff, on the guest's behalf) places orders against the active session. Each order is a kitchen ticket.
6. Kitchen staff move each order through its status lifecycle: `PENDING → PREPARING → READY → SERVED` (or `CANCELLED`).
7. When the party is ready to leave, staff generates a `Bill` for the session (computed server-side from all non-cancelled orders' line items — never trust a client-submitted total).
8. Bill is marked `PAID` (with `CASH` or `ONLINE` as the method), the session is closed, and the table becomes `AVAILABLE` again.
9. A background job automatically releases (`CLOSED`) any `PENDING` session that's gone unconfirmed for more than 15 minutes, freeing the table.

### Explicitly out of scope

- No multi-restaurant support. No per-restaurant ownership. Any `OWNER`/`ADMIN` can manage anything.
- No customer accounts, no customer login, no order history tied to a person across visits.
- No delivery/pickup — this is dine-in only.
- No public self-registration for staff — new staff users are provisioned directly (via API or an internal tool), not a public sign-up form.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Backend framework | [NestJS](https://nestjs.com/) (Node.js, TypeScript) |
| Backend language | TypeScript |
| ORM | Prisma (v7) |
| Database | PostgreSQL 17 |
| Auth (staff) | JWT, issued by the backend, stored in an httpOnly cookie by the frontend |
| Auth (guest) | Opaque random token in an httpOnly cookie (`guest_token`), *not* a JWT — identifies a browser/device, not a person |
| Frontend framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Frontend language | TypeScript |
| Frontend UI | React 19, Tailwind CSS v4 |
| Frontend data fetching | Server Components (direct server-to-server fetch to the backend) + Server Actions for mutations; a thin set of Next.js Route Handlers act as a backend-for-frontend proxy for a few guest-facing polling endpoints |
| Containerization | Docker Compose — three services: `postgres`, `backend`, `frontend` |
| Package manager | npm (both frontend and backend) |

### Why these choices (for context in future sessions)

- **Next.js Server Components/Actions over a SPA + REST client**: keeps the staff JWT and guest token server-side only (httpOnly cookies), never exposed to browser JavaScript. Client Components only exist where real interactivity is needed (buttons, forms with client-side pending states).
- **NestJS over a lighter framework**: gives structured modules, guards, and DTequalTo validation (`class-validator`) that scale reasonably as the domain (tables, sessions, orders, bills, guest-auth) grew.
- **Prisma**: type-safe query building directly from the schema; `serializeDecimals()` (see §6) exists because Prisma's `Decimal` type and JS `Date`/JSON don't serialize the way a REST API needs by default.

---

## 3. Repository layout

```
restaurant-platform/
├── docker-compose.yml            # base compose file — production-shaped services
├── docker-compose.override.yml   # dev-only overrides — bind mounts, hot reload, dev build target
├── backend/                      # NestJS API
├── frontend/                     # Next.js app
├── database/                     # (reserved — currently unused; Prisma owns schema/migrations)
├── docs/                         # project documentation (this file lives here)
└── infrastructure/               # (reserved for future deploy/infra config)
```

### Docker Compose — how the two override mechanisms work together

`docker-compose.yml` alone describes **production-shaped** containers (built images, no bind mounts). `docker-compose.override.yml` is **automatically merged in** by `docker compose` commands (this is standard Compose behavior — no flag needed) and layers on **dev-only** behavior: bind-mounting the source tree into the container, running `npm run dev`/`start:dev` instead of the built artifact, and enabling file-watcher polling (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`) since Docker's bind-mount filesystem events aren't always reliable.

**Known gotcha, already hit once:** the dev override defines anonymous volumes for `node_modules` (and `.next` for the frontend) so the host's `node_modules` doesn't clobber the container's. These anonymous volumes **persist across `docker compose up`** unless you force-renew them. If dependencies were changed (package.json edited, image rebuilt) but the running container still behaves like the old dependency set, run:

```bash
docker compose up -d -V <service>   # -V / --renew-anon-volumes forces fresh volumes
```

---

## 4. Backend (`backend/`)

### 4.1 Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # source of truth for the DB schema
│   └── migrations/             # generated migration history
├── prisma.config.ts             # Prisma 7 config (schema path, datasource url)
├── Dockerfile                   # multi-stage: base → development / build → production
├── src/
│   ├── main.ts                  # app bootstrap
│   ├── app.module.ts            # root module — wires every feature module together
│   ├── prisma/                  # PrismaService (extends PrismaClient), PrismaModule
│   ├── common/
│   │   └── serialize.ts         # serializeDecimals() — see §6
│   ├── auth/                    # staff login/register/JWT issuing + guards
│   │   ├── auth.controller.ts   # POST /auth/register, /auth/login, GET /auth/me
│   │   ├── jwt-auth.guard.ts    # requires a valid staff JWT
│   │   ├── jwt.strategy.ts      # passport-jwt strategy
│   │   ├── roles.guard.ts       # requires req.user.role to be in an allowed set
│   │   └── roles.decorator.ts   # @Roles(Role.OWNER, Role.ADMIN)
│   ├── users/                   # user lookups used internally by auth
│   ├── guest-auth/              # guest cookie issuing + QR-link HMAC signing/verification
│   │   ├── guest-auth.guard.ts  # reads/creates the guest_token cookie, attaches to request
│   │   └── guest-auth.service.ts
│   ├── restaurants/             # single-record Restaurant CRUD (staff-only writes)
│   ├── tables/
│   │   ├── tables.controller.ts        # staff-only: full table CRUD
│   │   └── public-tables.controller.ts # GET /public/tables — guest-facing, PII-free listing
│   ├── table-sessions/
│   │   ├── table-sessions.controller.ts        # staff: confirm/reject/close/find pending
│   │   ├── guest-table-sessions.controller.ts  # guest: open a session, view their own
│   │   ├── table-sessions.service.ts           # core session lifecycle logic
│   │   └── table-sessions-cleanup.task.ts      # @Cron job releasing stale PENDING sessions
│   ├── menu-items/              # flat CRUD, public reads, staff-only writes
│   ├── orders/
│   │   ├── orders.controller.ts        # staff: list/create/update status
│   │   └── (guest ordering lives in a Guest*Controller — see current source for exact split)
│   └── bills/                   # generate/pay a bill for a table session
```

### 4.2 Auth model

Two **separate, non-overlapping** auth systems:

1. **Staff auth** (`JwtAuthGuard` + `RolesGuard`): a real signed JWT (`JWT_SECRET`), containing `{ sub, email, role }`. Required on every staff-facing route. `@Roles(Role.OWNER, Role.ADMIN)` further restricts to write operations.
2. **Guest auth** (`GuestAuthGuard`): not a JWT — a random UUID stored in a `guest_token` httpOnly cookie, set automatically on first contact if missing. Identifies *a browser*, not a specific `TableSession` — a single guest token is legitimately reused across multiple visits/sessions over time (this was a real bug we hit and fixed: `guestToken` must **not** have a unique DB constraint).

There's also a separate **QR-signing** mechanism in `GuestAuthService` (`signTablePayload`/`verifyTablePayload`) using HMAC-SHA256 with a `QR_SECRET` — used to generate/verify tamper-proof table QR-code links with a long expiry (6 months), independent of the short-lived guest cookie.

### 4.3 Environment variables (backend)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signs/verifies staff JWTs |
| `QR_SECRET` | Signs/verifies QR table-link payloads |
| `PORT` | Defaults to 4000 |
| `NODE_ENV` | `development` / `production` |

---

## 5. Frontend (`frontend/`)

### 5.1 Structure

```
frontend/
├── next.config.ts               # output: 'standalone' for lean prod Docker image
├── Dockerfile                   # multi-stage: base → development / build → production
├── app/
│   ├── layout.tsx                # root layout — fonts, QueryProvider, Header
│   ├── page.tsx                  # redirects to /tables
│   ├── (auth)/login/page.tsx     # staff login form
│   ├── api/                      # Route Handlers acting as a BFF proxy
│   │   ├── auth/                 # login/register/logout/me — set/clear the session cookie
│   │   └── guest/                # a few guest-facing endpoints proxied for polling
│   ├── actions/                  # Server Actions — the primary way staff pages mutate data
│   │   ├── tables.ts
│   │   ├── table-sessions.ts     # open/confirm/reject/close
│   │   ├── menu-items.ts
│   │   └── orders.ts
│   ├── tables/
│   │   ├── page.tsx               # staff table grid (grouped by section)
│   │   ├── new/page.tsx           # add-table form
│   │   └── [id]/page.tsx          # table detail: seat guests / confirm-reject / order-taking
│   ├── menu-items/                # staff menu management (list, add, sections)
│   ├── guest/                     # ALL public, no-login guest-facing pages
│   │   ├── page.tsx                # pick a table
│   │   ├── tables/[tableId]/       # check-in form
│   │   └── session/[sessionId]/    # waiting screen, menu, cart, checkout
│   └── pending-sessions/          # REMOVED — do not recreate; see §1 workflow step 3
├── components/
│   ├── header.tsx                 # hides itself entirely on any /guest/* route
│   └── ui/                        # Input, Button — shared primitives
├── hooks/
│   └── use-auth.ts                # useAuth/useLogin/useRegister/useLogout (TanStack Query)
├── lib/
│   ├── api/                       # typed fetch wrappers per resource (client.ts is the base)
│   ├── auth/session.ts            # getSessionToken() — reads the httpOnly staff cookie
│   ├── types.ts                   # shared TS types mirroring the Prisma schema
│   └── validation/                # zod schemas for forms
└── providers/
    └── query-provider.tsx         # TanStack Query client provider
```

### 5.2 Data flow conventions

- **Server Components** fetch directly from the backend (`API_URL`, resolves to `http://backend:4000` inside Docker) using the staff token read server-side via `getSessionToken()`. This never touches the browser.
- **Server Actions** (`'use server'` files under `app/actions/`) are the standard way a staff page performs a mutation: read the cookie, call the typed `lib/api/*` function, `revalidatePath(...)`, and usually `redirect(...)`.
- **Route Handlers under `app/api/`** exist only where a Client Component needs to poll or where the guest flow needs a proxy that can read/set cookies from client-side `fetch()` calls (Server Actions can't be polled from `setInterval`, for example).
- **Client Components** are used sparingly — only where real interactivity (`useState`, `useActionState`, `useTransition`, polling) is required. Everything else defaults to a Server Component.

### 5.3 Environment variables (frontend)

| Variable | Purpose |
|---|---|
| `API_URL` | Backend base URL. **Use this one** — `http://backend:4000` inside Docker. There was a stray `BACKEND_URL` env var in one legacy Route Handler; it's been consolidated to `API_URL` everywhere. If you ever see `process.env.BACKEND_URL` again, that's drift — fix it to `API_URL`. |

---

## 6. Database schema (source of truth: `backend/prisma/schema.prisma`)

### Enums

```prisma
enum Role          { ADMIN OWNER }
enum TableStatus   { AVAILABLE OCCUPIED }
enum SessionStatus { PENDING ACTIVE BILLED CLOSED }
enum OrderStatus   { PENDING PREPARING READY SERVED CANCELLED }
enum PaymentMethod { CASH ONLINE }
enum BillStatus    { UNPAID PAID }
```

### Models (relationships summarized)

- **User** — staff account (`email`, `password` hash, `role`). No relation to `Restaurant` (single-restaurant model — any staff user can manage the one restaurant).
- **Restaurant** — exactly one row expected. Has many `Table`s and `MenuItem`s.
- **Table** — belongs to the restaurant, has a `number` + `capacity` + `status`. `@@unique([restaurantId, number])`. Has many `TableSession`s over its lifetime.
- **TableSession** — one guest visit. Carries guest contact info (`guestName`/`guestPhone`/`guestEmail`), the `guestToken` (**not unique** — see §4.2), `status`, `startedAt`/`endedAt`. Has many `Order`s and at most one `Bill`.
- **MenuItem** — belongs to the restaurant. Has `ingredients` (free text) in addition to `name`/`description`/`price`/`imageUrl`/`isAvailable`.
- **Order** — belongs to a `TableSession` (not to a customer — there are no customer accounts). Has many `OrderItem`s.
- **OrderItem** — snapshots `unitPrice` at order time (never re-derive historical pricing from the live `MenuItem.price`, which may have since changed).
- **Bill** — one-to-one with `TableSession`. `totalAmount` is computed server-side from all non-cancelled orders' items at generation time — **never** trust a client-submitted total.

### `serializeDecimals()` (`backend/src/common/serialize.ts`)

Prisma's `Decimal` type doesn't serialize to a plain JSON number by default, and naive recursive serialization also mangles `Date` objects into `{}`. This helper recursively walks a Prisma result and:
- Converts `Decimal` → `number` (via `.toNumber()`)
- Passes `Date` instances through untouched
- Recurses into plain objects/arrays

**Every service method that returns Prisma data containing a `Decimal` field (prices, totals) must pass its result through `serializeDecimals()` before returning.** This is a recurring source of bugs if forgotten on a new endpoint.

---

## 7. Conventions & gotchas worth remembering

- **Route pattern**: staff routes are guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` at the controller or method level. Guest routes use `@UseGuards(GuestAuthGuard)` under a `guest/...` or `public/...` prefix. Never mix the two guard types on the same route.
- **Single-restaurant assumption is baked in** — services call a `getRestaurantId()` helper that does `restaurant.findFirst()`. If multi-restaurant support is ever added, this is the first thing that needs to change, along with the `Role` model gaining ownership scoping.
- **Prisma 7 specifics**: the generated client's actual model types live at `node_modules/.prisma/client/index.d.ts` inside the container — not `node_modules/@prisma/client/*.d.ts` (that's just the runtime shell). After any schema change, always run `npx prisma generate` **inside the running container**, and if a Docker image rebuild is involved, confirm the client actually regenerated (`grep` for a field/model name in the generated `.d.ts` is a fast sanity check) before trusting a "0 errors" compile message from the watch-mode TypeScript compiler, which can be misleadingly stale.
- **Migrations**: `npx prisma migrate dev` requires creating a "shadow database" and can fail with a Postgres collation-version error in this environment. When that happens and the change is low-risk (index/constraint tweak, not a destructive restructure), `npx prisma db push` is an acceptable workaround — but it bypasses migration history, so note it here or in a commit message when used.
- **Never `redirect()` a user back to a page whose only content requires the state that action just removed.** (Real example: after rejecting a guest's table request, the table becomes `AVAILABLE` again — redirect to `/tables`, not back to that now-contentless table detail page.)
- **Server Actions calling `redirect()` from inside `startTransition()`** (as used by client-side button handlers) work correctly — this is the standard pattern for staff action buttons (confirm/reject/close) that need a client pending state but perform a server-side mutation + redirect.

---

## 8. Open / not-yet-built (as of last update)

Keep this list current — remove items once shipped, add new ones as they're identified.

- Guest-side ordering/cart/checkout pages exist in the file tree (`app/guest/session/[sessionId]/menu`, `cart`) but have not been walked through end-to-end in this reference doc's writing session — verify against current source before assuming behavior.
- No automated tests (unit or e2e) exist yet for either backend or frontend.
- No production deployment target configured yet (`infrastructure/` is empty).
- Error handling is inconsistent in places — some API failures surface as raw Next.js error screens instead of a friendly in-app message (a proper `app/error.tsx` boundary has been discussed but not built).

---

*Last written during an active build session. If you're an AI assistant picking this project back up: re-verify file paths and route names against the actual current source before making changes — this document describes the architecture and conventions, but individual files may have continued to evolve since it was last updated.*
