# Kashmir Tyre House

Modern tyre enquiry platform built as an npm/Turborepo monorepo with Next.js, TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL, Cloudflare R2, and Resend.

## Apps

- `apps/web` - public customer portal for tyre discovery, wishlist, and enquiries.
- `apps/admin` - admin portal shell for product, media, and enquiry management.
- `apps/api` - Next.js Route Handler backend for products, enquiries, admin APIs, email, and storage flows.

## Shared Packages

- `packages/ui` - reusable shadcn-style UI primitives.
- `packages/db` - Drizzle schema, Neon client, and migration commands.
- `packages/validators` - zod schemas shared by apps and API routes.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env.local
```

3. Optional local Postgres:

```bash
docker compose up -d
```

4. Run the workspace:

```bash
npm run dev
```

The default local ports are:

- Web: `http://localhost:3000`
- Admin: `http://localhost:3001`
- API: `http://localhost:3002`

## Useful Commands

```bash
npm run typecheck
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Notes

- Frontend customers do not need accounts.
- Admin authentication is intentionally left for the admin feature phase.
- `DATABASE_URL` is required before real product APIs can query Neon/PostgreSQL.
- Product and about images should use Cloudflare R2 once media upload flows are added.
