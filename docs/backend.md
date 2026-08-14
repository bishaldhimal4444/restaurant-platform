# Backend (`backend/`)

## Schema / DB

- `prisma/schema.prisma` — source of truth for every model/enum
- `prisma/migrations/` — migration history

## Auth

- `src/auth/` — staff login/register/JWT
  - `auth.controller.ts`, `auth.service.ts`, `jwt-auth.guard.ts`, `jwt.strategy.ts`, `roles.guard.ts`, `roles.decorator.ts`
- `src/guest-auth/` — guest cookie issuing + QR-link signing
  - `guest-auth.guard.ts`, `guest-auth.service.ts`
- `src/users/` — internal user lookups

## Core Resources

| Module | Purpose |
|---|---|
| `src/restaurants/` | Single-record restaurant CRUD |
| `src/tables/` | `tables.controller.ts` (staff CRUD), `public-tables.controller.ts` (guest-facing listing) |
| `src/table-sessions/` | `table-sessions.controller.ts` (staff: confirm/reject/close/pending), `guest-table-sessions.controller.ts` (guest: open/view own), `table-sessions-cleanup.task.ts` (auto-release stale pending) |
| `src/menu-items/` | Flat CRUD, public reads |
| `src/orders/` | Staff order management + status updates *(guest ordering split into a separate guest controller — check current source for exact file name)* |
| `src/bills/` | Generate/pay a bill |

## Shared

- `src/prisma/` — PrismaService/PrismaModule
- `src/common/serialize.ts` — `serializeDecimals()`, required on any response containing a Decimal field
- `src/app.module.ts` — wires every module together (add new modules here)
- `src/main.ts` — app bootstrap

## Config

- `prisma.config.ts`
- `Dockerfile`
- `.env` *(gitignored)* — `JWT_SECRET`, `QR_SECRET`, `DATABASE_URL`
