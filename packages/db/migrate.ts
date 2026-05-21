import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";
import { fileURLToPath } from "url";

if (!process.env.VERCEL) {
  console.log("Not a Vercel deployment — skipping auto-migration. Run `npm run db:migrate` locally.");
  process.exit(0);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL not set — skipping migrations.");
  process.exit(0);
}

const migrationsFolder = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "drizzle"
);

console.log("Running migrations...");

if (url.includes("neon.tech")) {
  const db = drizzleNeon(neon(url));
  await migrateNeon(db, { migrationsFolder });
} else {
  const client = postgres(url, { max: 1 });
  const db = drizzlePostgres(client);
  await migratePostgres(db, { migrationsFolder });
  await client.end();
}

console.log("Migrations complete.");
