# Skill: Build Admin CRUD

Use this skill when creating admin management features.

## Goal

Build practical, secure, easy-to-use admin CRUD screens.

## Standard CRUD Flow

For each entity:

1. List records in a table.
2. Add search if useful.
3. Add filters if useful.
4. Add create form.
5. Add edit form.
6. Add delete with confirmation.
7. Show loading state.
8. Show empty state.
9. Show error state.
10. Show success/error toast.

## Admin UI Stack

- shadcn/ui
- TanStack Table
- react-hook-form
- zod
- Server actions or Route Handlers as appropriate
- Drizzle ORM

## Product Admin Fields

Support:

- Product name
- Brand
- Category
- Tyre size
- Vehicle type
- Load index
- Load capacity
- Star rating / ply rating
- Application details
- Product images
- Active/inactive status if needed

## Safety Rules

- Validate on client and server.
- Confirm delete actions.
- Do not expose admin APIs publicly.
- Protect admin routes.
- Handle failed uploads safely.