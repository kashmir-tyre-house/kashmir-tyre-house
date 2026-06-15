import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "drizzle-kit";

// drizzle-kit does not auto-load the monorepo root `.env.local`, so pull
// DATABASE_URL from it (or `.env`) when it isn't already in the environment.
function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const candidates = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "../../.env.local"),
    resolve(process.cwd(), "../../.env")
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const match = readFileSync(file, "utf8").match(/^DATABASE_URL=(.+)$/m);
    if (match) {
      process.env.DATABASE_URL = match[1].trim().replace(/^["']|["']$/g, "");
      return;
    }
  }
}

loadDatabaseUrl();

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  },
  strict: true,
  verbose: true
});
