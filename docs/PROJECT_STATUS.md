# CityScape Legacy Lounge & Bar — Project Status & Workflow

**Project type:** Full-stack restaurant management platform (staff back-office + guest self-order)
**Stack:** Next.js 16 / React 19 (frontend) · NestJS 11 / Prisma 7 / PostgreSQL 17 (backend) · Docker Compose
**Document owner:** Bishal
**Last updated:** 2026-09-06
**Status as of this update:** Core platform functional end-to-end (seat → order → bill → pay); hardening phase not yet started

> This document is meant to be updated as work happens, not written once and forgotten. Treat Section 3 (module status) and Section 7 (changelog) as living — update them at the end of each work session.

---

## 1. Project Overview

CityScape Legacy Lounge & Bar is a dine-in restaurant management system with two user-facing surfaces:

- **Staff/Admin console** — table management, menu & category management, live order tracking, billing, customer records, and a daily sales dashboard. Access is role-gated (`ADMIN`, `OWNER`, `STAFF`).
- **Guest ordering flow** — a walk-in customer opens a table-specific link, starts a session, browses the menu, places orders, and views/pays their bill — without creating an account, via a short-lived guest token.

### Goals
- Digitize the dine-in order lifecycle: table → session → order → bill → payment → table released.
- Give staff a single dashboard for daily operations (active tables, pending guest requests, sales).
- Keep guest onboarding frictionless (no account creation required).

### Out of scope (for now)
- Online payment processing (currently a label only — see Section 5).
- Multi-restaurant / multi-tenant support (schema allows it; service layer does not yet enforce it).
- Kitchen display / inventory management.

---

## 2. Architecture

```
restaurant-platform/
├── backend/     NestJS API — auth, business logic, Prisma/Postgres access
├── frontend/    Next.js app — staff console (SSR/server actions) + guest flow
├── docker-compose.yml            Production-shaped service graph
├── docker-compose.override.yml   Local dev overrides (hot reload, volumes)
└── docs/                         (this file lives here)
```

**Backend module map:** `auth` · `guest-auth` · `users` · `restaurants` · `tables` · `table-sessions` · `menu-items` · `categories` · `orders` · `bills` · `customers` · `dashboard` · `prisma` (shared client) · `common` (shared serialization helpers)

**Data model (Prisma):** `User`, `Restaurant`, `Table`, `TableSession`, `Customer`, `Category`, `MenuItem`, `Order`, `OrderItem`, `Bill` — with enums for `Role`, `TableStatus`, `SessionStatus`, `OrderStatus`, `PaymentMethod`, `BillStatus`.

**Key architectural decisions already made:**
- Staff auth = JWT (`@nestjs/passport` + `passport-jwt`); guest auth = separate short-lived token system, not full accounts.
- Role enforcement via a `RolesGuard` + `@Roles()` decorator, not ad-hoc checks in controllers.
- Money-moving operations (bill generation, bill payment) run inside Prisma `$transaction` blocks — table release, session close, and customer spend update happen atomically.
- Guest-facing endpoints (`findAllPublic`, etc.) explicitly exclude PII and internal fields at the query level, not via response filtering.
- Session and order status changes are detected via client-side polling (4s interval), not WebSockets — see Section 5 for the tradeoff this implies.
- A scheduled cron task (`@nestjs/schedule`) auto-releases tables stuck in `PENDING` guest sessions after 15 minutes.

---

## 3. Module Completion Status

Update the **Status** and **Notes** columns as work happens. Status values: `Done` · `Working, needs tests` · `Working, needs polish` · `Not started`.

| Module | Status | Notes |
|---|---|---|
| Auth (staff) | Working, needs polish | Login/register/JWT/roles functional; has specs. No password-reset or refresh-token flow. |
| Guest auth | Working, needs tests | Token issuance/expiry logic in place; zero test coverage. |
| Users | Working, needs polish | Has specs. No user management UI (create/edit staff accounts) yet. |
| Restaurants | Working, needs polish | CRUD + specs exist. Service layer assumes single restaurant (`findFirst()`). |
| Tables | Working, needs tests | Public vs. staff views correctly separated. No tests. |
| Table sessions | Working, needs tests | Core lifecycle + cleanup cron in place. No tests despite being core money-path logic. |
| Menu items | Done | Full CRUD, featured/reorder logic, has specs (controller + service). |
| Categories | Working, needs tests | Basic CRUD. No tests. |
| Orders | Working, needs tests | Availability + active-session validation correct. No tests. |
| Bills | Working, needs tests | Transactional generate/pay logic correct. No tests — highest-priority gap given it's the money path. |
| Customers | Working, needs polish | Basic CRUD + notes. No tests, minimal UI. |
| Dashboard | Working, needs tests | Daily sales/orders/top-items aggregation working. No tests. |
| Docker/infra | Done | Multi-stage builds, healthchecks, dev override file all functional. Missing `.env.example`. |
| QR codes | Not started | `QR_SECRET` env var exists but unused; guests currently need a direct link, not a scan. |
| Real-time updates | Not started | Polling only, both guest session-end detection and (implicitly) staff order tracking. |
| Online payments | Not started | `PaymentMethod.ONLINE` is a label with no processor behind it. |
| Multi-tenancy | Not started | Schema supports multiple restaurants; service layer does not. |

---

## 4. Development Workflow

### 4.1 Environments
| Environment | How to run | Notes |
|---|---|---|
| Local dev | `docker compose up` (uses `docker-compose.override.yml` automatically) | Hot reload via mounted volumes + polling watch (`CHOKIDAR_USEPOLLING`). |
| Production-shaped local test | `docker compose -f docker-compose.yml up` | Runs the `runner` build target, no live reload — closest to real deploy. |

### 4.2 Required environment variables
No `.env.example` exists yet (tracked as an action item — see Section 6). Known required variables from `docker-compose.yml`:
- `JWT_SECRET` — staff auth signing secret
- `QR_SECRET` — reserved for guest-session/QR signing (not yet wired into code)
- `DATABASE_URL` — set automatically inside Compose; needed manually if running the backend outside Docker

### 4.3 Branching & commits (recommended if not already in place)
- `main` — always deployable.
- `feature/<short-name>` branches per module or fix, merged via PR even if solo — keeps a reviewable history.
- Conventional commit prefixes (`feat:`, `fix:`, `test:`, `chore:`, `docs:`) to keep the log scannable as the project grows.

### 4.4 Definition of Done (proposed standard for this project)
A feature/module is "Done" only when:
1. Endpoint(s) or page(s) implemented and manually verified against the happy path.
2. Edge cases handled (invalid state transitions, missing records, unauthorized roles) — mirroring the pattern already used in `orders.service.ts` and `bills.service.ts`.
3. Unit or e2e test coverage exists for the service layer.
4. No secrets or debug artifacts committed (see `cookies.txt` cleanup item).
5. This document's Section 3 status row is updated.

---

## 5. Known Gaps / Technical Debt Register

| # | Item | Impact | Priority |
|---|---|---|---|
| 1 | No test coverage for orders, bills, table-sessions, customers, dashboard, guest-auth | Regressions in money-handling logic could ship silently | High |
| 2 | No `.env.example` | New environment setup requires reverse-engineering `docker-compose.yml` | Medium |
| 3 | `cookies.txt` committed in `backend/` and `frontend/` | Repo hygiene / potential stale-credential leakage | Medium |
| 4 | Single-restaurant assumption (`restaurant.findFirst()`) | Blocks multi-location support later | Low (unless multi-tenant is a near-term goal) |
| 5 | Polling instead of WebSockets for order/session status | Added latency, unnecessary request volume at scale | Medium |
| 6 | No QR code generation despite reserved `QR_SECRET` | Guest onboarding still needs a manually shared link | Medium |
| 7 | No real payment processor | `ONLINE` payment method can't actually be collected | Low until a payment gateway decision is made |

---

## 6. Immediate Action Items (next session)

- [ ] Delete `backend/cookies.txt` and `frontend/cookies.txt`; confirm `.gitignore` covers them going forward.
- [ ] Add `.env.example` at the repo root documenting `JWT_SECRET`, `QR_SECRET`, `DATABASE_URL`.
- [ ] Write unit tests for `bills.service.ts` and `orders.service.ts` first (highest-risk, money-handling logic).
- [ ] Write unit tests for `table-sessions.service.ts` (covers the cleanup cron's core state transition).
- [ ] Decide: real-time (WebSocket) upgrade now, or defer until after test coverage is solid.

---

## 7. Changelog

Keep this in reverse-chronological order. Add an entry whenever a module's status changes or a milestone is hit.

| Date | Change |
|---|---|
| 2026-09-06 | Added menu dashboard fields migration; initial project status document created. |
| 2026-09-04 | Added `STAFF` role and `Customer` model. |
| 2026-08-12 | Added `PENDING` session status + guest token expiry handling. |
| 2026-08-11 | Added guest token to `TableSession`. |
| 2026-08-10 | Initial dine-in schema (`init_dine_in` migration). |

---

## 8. Roadmap (proposed phases)

**Phase 1 — Harden what exists** *(recommended current focus)*
Test coverage for orders/bills/table-sessions/guest-auth; add `.env.example`; repo cleanup; end-to-end test of the full guest flow (seat → order → bill → pay).

**Phase 2 — Real-time updates**
WebSocket gateway for order status; live staff dashboard updates; replace guest polling with a socket subscription.

**Phase 3 — QR code generation**
Per-table QR codes linking to the guest session URL; printable table-tent view for staff.

**Phase 4 — Multi-tenancy cleanup** *(only if multiple locations become a real requirement)*
Replace `findFirst()` restaurant lookups with an explicit, user-scoped `restaurantId`.

**Phase 5 — Real payments**
Integrate a payment gateway (e.g. Khalti/eSewa given NPR pricing, or Stripe); handle webhook confirmation and failure/retry states.
