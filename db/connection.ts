// SQLite connection (replaces MongoDB / Mongoose).
// Uses the built-in `node:sqlite` module — synchronous, zero dependencies,
// works under both Bun and Node.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dbPath = process.env.SQLITE_PATH
  ? resolve(process.env.SQLITE_PATH)
  : resolve("./data/dialogs.sqlite");

// Make sure the directory the database file lives in exists.
try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch {
  /* ignore — let DatabaseSync report the real error */
}

const db = new DatabaseSync(dbPath);

export async function connectDB(): Promise<DatabaseSync> {
  // The DatabaseSync instance is created eagerly above; this function exists
  // so callers can `await connectDB()` before the schema is created in
  // db/models.ts.
  return db;
}

export async function disconnectDB(): Promise<void> {
  try {
    db.close();
    console.log("Database disconnected. ");
  } catch (error) {
    console.error("Failed to disconnect. : ", error);
  }
}

export { db };
