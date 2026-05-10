# Kashmir Tyre House

Modern tyre enquiry platform built as an npm/Turborepo monorepo with Next.js, TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL, Cloudflare R2, and Resend.

## Project Structure

- `apps/web` - public customer portal for tyre discovery, wishlist, and enquiries.
- `apps/admin` - admin portal shell for product, media, and enquiry management.
- `apps/api` - Next.js Route Handler backend for products, enquiries, admin APIs, email, and storage flows.
- `packages/ui` - reusable shadcn-style UI primitives.
- `packages/db` - Drizzle schema, Neon client, and migration commands.
- `packages/validators` - zod schemas shared by apps and API routes.

## Prerequisites

- Node.js `22+`
- npm `10+`
- Docker Desktop, for local PostgreSQL
- `psql`, for applying local SQL migrations directly

Check versions:

```bash
node -v
npm -v
docker --version
psql --version
```

## Initial Setup

Install dependencies from the repo root:

```bash
npm install
```

Create the root local environment file:

```bash
cp .env.example .env.local
```

For the local API app, also create:

```bash
cp .env.example apps/api/.env.local
```

At minimum, both env files need:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/kashmir_tyre_house
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Local Database

Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

This uses:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/kashmir_tyre_house
```

If port `5432` is already used on your machine, run Postgres on another port, for example `5433`:

```bash
docker run -d \
  --name kth-postgres \
  --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kashmir_tyre_house \
  -p 5433:5432 \
  -v kth-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

Then update `DATABASE_URL` in `.env.local` and `apps/api/.env.local`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5433/kashmir_tyre_house
```

## Database Migrations

Generate a migration after changing `packages/db/src/schema.ts`:

```bash
npm run db:generate
```

For local PostgreSQL, apply the generated SQL with `psql`:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f packages/db/drizzle/0000_kth-initial-entities.sql
```

If your shell has not loaded `.env.local`, run:

```bash
set -a
. ./.env.local
set +a
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f packages/db/drizzle/0000_kth-initial-entities.sql
```

Verify tables:

```bash
psql "$DATABASE_URL" -c "\dt"
```

`npm run db:migrate` is intended for the configured remote database flow. The current DB package uses the Neon serverless driver, so local TCP Postgres migrations should be applied with `psql`.

## Run The Apps

Run every app together:

```bash
npm run dev
```

Or run each app separately.

### Web

Public customer portal.

```bash
npm run dev:web
```

Local URL:

```text
http://localhost:3000
```

### API

Next.js Route Handler backend.

Before starting, confirm `apps/api/.env.local` contains `DATABASE_URL`.

```bash
npm run dev:api
```

Local URL:

```text
http://localhost:3002
```

Useful checks:

```text
http://localhost:3002/api/health
http://localhost:3002/api/products
```

### Admin

Admin portal shell.

```bash
npm run dev:admin
```

Local URL:

```text
http://localhost:3001
```

## Notes

- Frontend customers do not need accounts.
- Admin authentication is intentionally left for the admin feature phase.
- `DATABASE_URL` is required before product APIs can query PostgreSQL.
- Product and about images should use Cloudflare R2 once media upload flows are added.

## Useful Commands

```bash
npm run typecheck
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```
