import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const url = process.env.DATABASE_URL;
if (!url) {
  if (process.env.VERCEL) {
    console.error("DATABASE_URL is required to run migrations on Vercel.");
    process.exit(1);
  }

  console.log("DATABASE_URL not set — skipping migrations.");
  process.exit(0);
}

const migrationsFolder = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "drizzle"
);

if (!fs.existsSync(migrationsFolder)) {
  console.error(`Migrations folder not found: ${migrationsFolder}`);
  process.exit(1);
}

const migrationFiles = fs
  .readdirSync(migrationsFolder)
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort();

if (migrationFiles.length === 0) {
  console.error(`No migration files found in: ${migrationsFolder}`);
  process.exit(1);
}

console.log("Running database migrations...");
console.log(`Environment: ${process.env.VERCEL ? "Vercel" : "local"}`);
console.log(`Migrations folder: ${migrationsFolder}`);
console.log(`Migration files found: ${migrationFiles.length}`);
console.log(`Database host: ${new URL(url).host}`);

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
