# Skill: Review Before Commit

Use this skill before finalizing any feature.

## Goal

Catch issues before code is committed.

## Review Checklist

### Requirement Fit

- Does this match the Kashmir Tyre House project scope?
- Does it support the enquiry platform goal?
- Does it avoid unnecessary complexity?

### UI/UX

- Is the UI premium?
- Is it responsive?
- Is the CTA clear?
- Are empty/loading/error states handled?
- Is the experience simple for non-technical users?

### Code

- Is TypeScript used properly?
- Are components reusable?
- Is validation handled?
- Are API errors handled?
- Are files placed correctly?
- Is code readable?

### Performance

- Are images optimized?
- Are unnecessary client components avoided?
- Are animations lightweight?
- Is data loading efficient?

### Security

- Are admin routes protected?
- Is server-side validation present?
- Are secrets kept in env variables?
- Is user input sanitized/validated?

## Final Output

Return:

- Passed checks
- Failed checks
- Fixes required
- Optional improvements