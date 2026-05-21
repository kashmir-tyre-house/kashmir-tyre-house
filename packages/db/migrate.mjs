import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const shouldRunMigrations =
  process.env.VERCEL === "1" || process.env.RUN_DB_MIGRATIONS === "true";

if (!shouldRunMigrations) {
  console.log(
    "Skipping database migrations outside Vercel. Set RUN_DB_MIGRATIONS=true to run them manually."
  );
  process.exit(0);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required to run migrations.");
  process.exit(1);
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

try {
  if (url.includes("neon.tech")) {
    console.log("Using Neon HTTP migrator.");
    const db = drizzleNeon(neon(url));
    await migrateNeon(db, { migrationsFolder });
  } else {
    console.log("Using postgres-js migrator.");
    const client = postgres(url, { max: 1 });
    try {
      const db = drizzlePostgres(client);
      await migratePostgres(db, { migrationsFolder });
    } finally {
      await client.end();
    }
  }

  console.log("Migrations complete.");
} catch (error) {
  console.error("Database migration failed.");
  if (error instanceof Error) {
    console.error(error.stack ?? error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
