import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  // Neon cloud URLs go through the HTTP driver; local/standard Postgres uses postgres.js
  if (databaseUrl.includes("neon.tech")) {
    return drizzleNeon(neon(databaseUrl), { schema });
  }

  return drizzlePostgres(postgres(databaseUrl), { schema });
}

export * from "./schema";
