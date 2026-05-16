import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type DbInstance =
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePostgres<typeof schema>>;

function createDbFromUrl(url: string): DbInstance {
  if (url.includes("neon.tech")) {
    return drizzleNeon(neon(url), { schema });
  }
  // Cap pool size — default 10 per instance causes exhaustion when new
  // instances are created on every request (e.g. during HMR in dev).
  return drizzlePostgres(postgres(url, { max: 5 }), { schema });
}

// HMR-safe singleton: Next.js reloads modules on every hot update, which
// would create a new connection pool on each reload without this guard.
declare global {
  // eslint-disable-next-line no-var
  var __kth_db: DbInstance | undefined;
}

let _db: DbInstance | undefined;

export function getDb(): DbInstance {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");

  if (process.env.NODE_ENV === "production") {
    _db = createDbFromUrl(url);
  } else {
    globalThis.__kth_db ??= createDbFromUrl(url);
    _db = globalThis.__kth_db;
  }

  return _db;
}

export * from "./schema";
