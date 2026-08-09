# FutureCard

Digital visiting card SaaS — Next.js App Router, **Supabase (Postgres)**, NextAuth, Tailwind, Zod.

> Auth uses NextAuth credentials + bcrypt against the `users` table in Supabase.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. In **SQL Editor**, run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
3. Copy `.env.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → `service_role`)
   - `NEXTAUTH_SECRET`
4. Seed demo users and start the app:

```bash
pnpm seed
pnpm dev
```

## Vercel + GitHub

Set the same Supabase + NextAuth env vars for **Production** and **Preview**.

## Demo logins

| Role  | Email                    | Password     |
|-------|--------------------------|--------------|
| Admin | `admin@futurecard.local` | `Admin@123456` |
| User  | `demo@futurecard.local`  | `Demo@123456` |

(Override via `SEED_*` env vars before `pnpm seed`.)

## Scripts

```bash
pnpm dev      # Next.js
pnpm build    # production build
pnpm seed     # upsert admin + demo user in Supabase
pnpm lint
```
