# Frontend (`frontend/`)

## Staff Pages (login required)

| Path | Purpose |
|---|---|
| `app/tables/page.tsx` | Tables grid (Main Entrance / Rooftop / Other sections) |
| `app/tables/new/page.tsx` | Add table form |
| `app/tables/[id]/page.tsx` | Table detail (seat guests / confirm-reject / occupied+orders) |
| `app/tables/[id]/seat-guests-form.tsx`<br>`confirm-reject-buttons.tsx`<br>`close-session-button.tsx`<br>`order-form.tsx` | Supporting components for the detail page |
| `app/menu-items/page.tsx` | Menu list |
| `app/menu-items/menu-item-row.tsx` | Per-item toggle/delete |
| `app/menu-items/new/page.tsx` | Add menu item form |
| `app/menu-items/sections/` | Menu sections *(exists, not yet verified end-to-end)* |
| `app/(auth)/login/page.tsx` | Staff login form |

## Guest Pages (no login)

| Path | Purpose |
|---|---|
| `app/guest/page.tsx` | Table picker + waiting-for-confirmation screen (both in one file) |
| `app/guest/tables/[tableId]/page.tsx`<br>`session/page.tsx`<br>`session/guest-session-form.tsx` | Check-in flow |
| `app/guest/session/[sessionId]/page.tsx` | Post-confirmation router/success screen |
| `app/guest/session/[sessionId]/menu/page.tsx`<br>`menu-list.tsx`<br>`add-to-cart-button.tsx`<br>`cart-button.tsx` | Menu browsing |
| `app/guest/session/[sessionId]/cart/page.tsx` | Cart + place order |
| `app/guest/hooks/use-cart.ts` | localStorage cart logic |
| `app/guest/layout.tsx` | Guest-specific layout (header hides itself here) |

## Mutations — Server Actions

*(Where "change something" logic lives)*

- `app/actions/tables.ts`
- `app/actions/table-sessions.ts` — open/confirm/reject/close
- `app/actions/menu-items.ts`
- `app/actions/orders.ts`

## Data Fetching (typed backend calls)

- `lib/api/client.ts` — base fetch wrapper (staff, uses `API_URL` + JWT)
- `lib/api/guest.ts` — base fetch wrapper (guest, relays cookies)
- `lib/api/tables.ts`, `table-sessions.ts`, `menu-items.ts`, `orders.ts`, `auth.ts`

## API Routes (BFF proxy)

*(For things Client Components need to `fetch()`/poll)*

- `app/api/auth/*` — login/register/logout/me
- `app/api/guest/*` — guest polling/order endpoints
- `app/api/menu-items/[id]/route.ts`

## Shared

- `components/header.tsx` — nav bar (staff only, hidden on `/guest`)
- `components/ui/button.tsx`, `input.tsx` — primitives
- `lib/auth/session.ts` — reads the staff httpOnly cookie
- `lib/types.ts` — shared TS types
- `lib/validation/*.ts` — zod schemas
- `proxy.ts` — route protection (which paths require login)
- `hooks/use-auth.ts` — client-side auth state (TanStack Query)
