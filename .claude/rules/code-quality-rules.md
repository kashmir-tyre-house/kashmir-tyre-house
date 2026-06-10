# Rule: Code Quality

## General

- Write clean, maintainable TypeScript.
- Prefer simple solutions.
- Avoid over-engineering.
- Keep naming clear.
- Keep folder structure scalable.
- Avoid duplicate code.
- Extract reusable components.
- Add comments only where useful.

## Error Handling

- Handle expected errors.
- Show user-friendly messages.
- Log useful server-side errors.
- Avoid leaking internal errors to users.

## Validation

- Validate forms with zod.
- Validate API input server-side.
- Validate file uploads.
- Validate enquiry payloads.

## Security

- Protect admin routes.
- Keep env variables private.
- Do not trust client data.
- Sanitize/validate user input.
- Confirm destructive actions.

## Completion Criteria

A feature is complete only when:

- It works
- It is responsive
- It has loading/error/empty states
- It is validated
- It matches project scope
- It does not hurt performance
- It looks polished