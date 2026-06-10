# Rule: Tech Stack

Use the approved tech stack only unless there is a strong reason.

## Monorepo

- Turborepo
- npm
- Node.js LTS

## Frontend

- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui
- react-hook-form
- zod
- TanStack Query
- TanStack Table for admin tables
- next/image

## Backend

- Next.js Route Handlers
- No separate backend service for current scope

## Database

- PostgreSQL
- Drizzle ORM
- drizzle-kit
- Neon

## Storage

- Cloudflare R2 for product and about images

## Email

- Resend preferred
- SendGrid alternative

## Deployment

- Vercel for frontend/backend
- Neon for database
- Cloudflare R2 for storage
- Resend for email