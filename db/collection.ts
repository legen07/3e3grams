// Generic document-style SQLite collection (replaces a MongoDB collection).
// Used by clickBank/scrapeClick.ts for the `aff_products` collection.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Values `node:sqlite` accepts as bound parameters (the type is not exported). */
type BindValue = null | number | bigint | string | NodeJS.ArrayBufferView;

export function openDatabase(path: string): DatabaseSync {
  const dbPath = resolve(path);
  try {
    mkdirSync(dirname(dbPath), { recursive: true });
  } catch {
    /* ignore — let DatabaseSync report the real error */
  }
  return new DatabaseSync(dbPath);
}

export class Collection {
  db: DatabaseSync;
  table: string;
  keyField: string;

  constructor(db: DatabaseSync, table: string, keyField = "proName") {
    this.db = db;
    this.table = table;
    this.keyField = keyField;
    db.exec(
      `CREATE TABLE IF NOT EXISTS ${table} ` +
      `(${keyField} TEXT PRIMARY KEY, data TEXT)`,
    );
  }

  find(query: Record<string, unknown> = {}): unknown[] {
    const keys = Object.keys(query);
    let sql = `SELECT data FROM ${this.table}`;
    const vals: BindValue[] = [];
    if (keys.length) {
      sql += " WHERE " + keys.map((k) => `${k} = ?`).join(" AND ");
      vals.push(...keys.map((k) => query[k] as BindValue));
    }
    return this.db
      .prepare(sql)
      .all(...vals)
      .map((r) => JSON.parse(r.data as string));
  }

  findOne(query: Record<string, unknown> = {}): unknown | null {
    const rows = this.find(query);
    return rows.length ? rows[0] : null;
  }

  insertOne<T extends Record<string, unknown>>(doc: T): T {
    const key = doc[this.keyField] as BindValue;
    this.db
      .prepare(
        `INSERT OR REPLACE INTO ${this.table} (${this.keyField}, data) VALUES (?, ?)`,
      )
      .run(key, JSON.stringify(doc));
    return doc;
  }
}
