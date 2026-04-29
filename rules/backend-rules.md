# Rule: Backend Development

## API Rules

- Use Next.js Route Handlers.
- Keep APIs simple and focused.
- Validate every request with zod.
- Return consistent error responses.
- Do not expose sensitive data.
- Do not expose secrets to the client.

## Database Rules

- Use Drizzle ORM.
- Use PostgreSQL on Neon.
- Keep schema readable.
- Use migrations with drizzle-kit.
- Avoid unnecessary complex relationships.
- Index commonly filtered fields when needed.

## Storage Rules

- Use Cloudflare R2 for product/about images.
- Validate uploads.
- Store only required image metadata in DB.
- Handle failed uploads safely.

## Email Rules

- Use Resend unless changed.
- Send enquiry notification emails.
- Include selected products and user details.
- Keep email template professional.