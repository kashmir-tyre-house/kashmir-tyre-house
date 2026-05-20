import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "path";
import { fileURLToPath } from "url";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const migrationsFolder = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "drizzle"
);

const db = drizzle(neon(url));

console.log("Running migrations...");
await migrate(db, { migrationsFolder });
console.log("Migrations complete.");
