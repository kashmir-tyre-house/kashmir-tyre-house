/**
 * Error thrown when a page cannot be rendered. Caught by the route's
 * `error.tsx` boundary, which shows the friendly fallback UI. The message is
 * for the console and server logs only — it is never displayed to the user.
 */
export class PageLoadError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PageLoadError";
  }
}
