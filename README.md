# FutureCard

Digital visiting card SaaS — Next.js App Router, MongoDB, NextAuth, Tailwind, Zod.

> **Note:** This is a single Next.js app (not NestJS). Auth uses NextAuth credentials + bcrypt against MongoDB.

## Fix login (most common issue)

Login fails with “Invalid email or password” when **MongoDB is not running** or users were **never seeded**.

### Option A — In-memory Mongo (works without Docker)

Keep three terminals:

```bash
# Terminal 1 — start DB (leave running)
pnpm db:mem

# Terminal 2 — create/reset demo users + verify bcrypt hashes
pnpm seed

# Terminal 3 — app
pnpm dev
```

### Option B — Docker Mongo

```bash
# Start Docker Desktop first, then:
pnpm db:up
# Set MONGODB_URI=mongodb://127.0.0.1:27017/futurecard in .env.local
pnpm seed
pnpm dev
```

## Demo logins

| Role   | Email                       | Password       |
|--------|-----------------------------|----------------|
| Admin  | `admin@digitalvcard.local`  | `Admin@123456` |
| Admin  | `admin@futurecard.local`    | `Admin@123456` |
| Client | `client@dhanya.local`       | `Client@123456`|
| User   | `demo@futurecard.local`     | `Demo@123456`  |

Demo public card: http://localhost:3000/dhanya_enterprises

## Auth stack (where to look)

| Piece | Path |
|-------|------|
| NextAuth + bcrypt compare | `src/lib/auth.ts` |
| Login form / `signIn()` | `src/app/(auth)/login/page.tsx` |
| User model | `src/models/User.ts` |
| Seed (upsert + hash verify) | `scripts/seed.ts` |
| DB connection | `src/lib/db.ts` |

`pnpm seed` **re-hashes and upserts** passwords every run, so stale hashes are fixed by re-seeding.
