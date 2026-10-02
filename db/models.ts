// SQLite models — replaces the Mongoose schemas.
//
// Each Mongoose model is mapped to a SQLite table and exposed through a tiny
// ODM-like wrapper that supports the exact call patterns used by the crawler:
//
//   Channel.find({ id })[0]        -> Row | undefined
//   Channel.create({ ... })        -> Row
//   chatDB.save()                  -> Row                  (upsert)
//   JoinedDate.find({ date })[0]   -> Row | undefined
//   JoinedDate.create({ date })    -> Row
//   joinedDate.joined.push({...})  -> mutates array
//   JoinLater.findOne({})          -> Row | null
//   joinLater.list.push(id)        -> mutates array
//
// A generic `Collection` class is also exported for document-style storage
// (used by clickBank/scrapeClick.ts).
import { db } from "./connection.ts";
import { Collection } from "./collection.ts";

const now = () => new Date().toISOString();

type FieldType = "integer" | "boolean" | "json" | "date" | "text";

interface Field {
  name: string;
  type: FieldType;
  pk?: boolean;
  default?: unknown;
}

/** Values `node:sqlite` accepts as bound parameters (the type is not exported). */
type BindValue = null | number | bigint | string | NodeJS.ArrayBufferView;
/** Column values returned by `node:sqlite` (the type is not exported). */
type ColumnValue = null | number | bigint | string | NodeJS.NonSharedUint8Array;

/** A hydrated row: the model's declared fields plus the `save()` upsert. */
export type Savable<T> = T & { save(): void };

export interface Model<T> {
  table: string;
  pk: Field;
  fields: Field[];
  find(query?: Partial<T>): Savable<T>[];
  findOne(query?: Partial<T>): Savable<T> | null;
  create(data?: Partial<T>): Savable<T>;
}
// Field type metadata drives (de)serialization so booleans / JSON arrays /
// Dates are stored correctly in SQLite and round-trip back to JS values.
function serialize(field: Field, value: unknown): BindValue {
  switch (field.type) {
    case "integer":
      return value == null ? 0 : Number(value);
    case "boolean":
      return value ? 1 : 0;
    case "json":
      return JSON.stringify(value == null ? [] : value);
    case "date":
      return value instanceof Date ? value.toISOString() : (value as BindValue);
    default:
      return value == null ? "" : String(value);
  }
}

function deserialize(field: Field, value: ColumnValue): unknown {
  if (value == null)
    return Array.isArray(field.default) ? [...field.default] : field.default;
  switch (field.type) {
    case "integer":
      return Number(value);
    case "boolean":
      return value === 1 || value === "1";
    case "json": {
      try {
        return JSON.parse(value as string);
      } catch {
        return Array.isArray(field.default) ? [...field.default] : field.default;
      }
    }
    case "date":
      return value ? new Date(value as string) : field.default;
    default:
      return value;
  }
}

// A single hydrated document. Property assignment (chatDB.username = c,
// chatDB.fully_scraped = true) just sets fields; save() persists everything.
class Row {
  [key: string]: unknown;
  private _model: Model<Record<string, unknown>>;
  private _exists: boolean;
  private _pkValue: BindValue | undefined;

  constructor(
    model: Model<Record<string, unknown>>,
    row?: Record<string, ColumnValue>,
  ) {
    this._model = model;
    this._exists = !!row;
    this._pkValue = row ? row[model.pk.name] : undefined;
    for (const f of model.fields) {
      this[f.name] = row
        ? deserialize(f, row[f.name])
        : Array.isArray(f.default)
          ? [...f.default]
          : f.default;
    }
  }

  save(): this {
    const m = this._model;
    const t = now();
    const cols = m.fields.map((f) => f.name);
    const vals = m.fields.map((f) => serialize(f, this[f.name]));

    if (this._exists) {
      const pairs = cols
        .map((c, i) =>
          c === m.pk.name ? null : ([c, vals[i]] as [string, BindValue]),
        )
        .filter((p): p is [string, BindValue] => p !== null);
      const setSql = pairs.map((p) => `${p[0]} = ?`).join(", ");
      const setVals = pairs.map((p) => p[1]);
      db.prepare(
        `UPDATE ${m.table} SET ${setSql}, updated_at = ? WHERE ${m.pk.name} = ?`,
      ).run(...setVals, t, this._pkValue as BindValue);
    } else {
      const placeholders = cols.map(() => "?").join(", ");
      db.prepare(
        `INSERT INTO ${m.table} (${cols.join(", ")}, created_at, updated_at) ` +
          `VALUES (${placeholders}, ?, ?)`,
      ).run(...vals, t, t);
      this._exists = true;
      this._pkValue = serialize(m.pk, this[m.pk.name]);
    }
    return this;
  }
}

function buildSelect(
  model: Model<Record<string, unknown>>,
  query: Record<string, unknown>,
): { sql: string; vals: BindValue[] } {
  let sql = `SELECT * FROM ${model.table}`;
  const clauses: string[] = [];
  const vals: BindValue[] = [];
  for (const [k, v] of Object.entries(query)) {
    const f = model.fields.find((ff) => ff.name === k);
    clauses.push(`${k} = ?`);
    vals.push(f ? serialize(f, v) : (v as BindValue));
  }
  if (clauses.length) sql += " WHERE " + clauses.join(" AND ");
  return { sql, vals };
}

function createModel<T>(table: string, fields: Field[]): Model<T> {
  const pk = fields.find((f) => f.pk);
  if (!pk) throw new Error(`Model ${table} has no primary key field`);

  // Built against the loose `Record<string, unknown>` shape and cast to the
  // document shape `T` on the way out — the row class is inherently dynamic.
  let model: Model<Record<string, unknown>>;

  model = {
    table,
    pk,
    fields,
    find: (query: Record<string, unknown> = {}) => {
      const { sql, vals } = buildSelect(model, query);
      return db
        .prepare(sql)
        .all(...vals)
        .map((r) => new Row(model, r));
    },
    findOne: (query: Record<string, unknown> = {}) => {
      const { sql, vals } = buildSelect(model, query);
      const rows = db.prepare(sql).all(...vals);
      return rows.length ? new Row(model, rows[0]) : null;
    },
    create: (data: Record<string, unknown> = {}) => {
      const rec = new Row(model);
      for (const [k, v] of Object.entries(data)) rec[k] = v;
      rec.save();
      return rec;
    },
  };

  return model as unknown as Model<T>;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT,
    members INTEGER DEFAULT 0,
    fully_scraped INTEGER DEFAULT 0,
    last_msg_scraped INTEGER DEFAULT 0,
    groups_scraped TEXT DEFAULT '[]',
    channels_scraped TEXT DEFAULT '[]',
    associated_group_name TEXT,
    associated_group_is_member INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_channels_assoc_group_name
    ON channels(associated_group_name);

  CREATE TABLE IF NOT EXISTS joined_dates (
    date TEXT PRIMARY KEY,
    joined TEXT DEFAULT '[]',
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS join_later (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    list TEXT DEFAULT '[]',
    created_at TEXT,
    updated_at TEXT
  );
`);
// Ensure the single join_later row exists.
db.prepare("INSERT OR IGNORE INTO join_later (id, list) VALUES (1, '[]')").run();

// ---------------------------------------------------------------------------
// Document shapes
// ---------------------------------------------------------------------------
export interface ChannelDoc {
  id: number;
  name: string;
  username?: string;
  members: number;
  fully_scraped: boolean;
  last_msg_scraped: number;
  groups_scraped: unknown[];
  channels_scraped: unknown[];
  associated_group_name?: string;
  associated_group_is_member: boolean;
}

export interface JoinedEntry {
  chat_id: number;
  type: "group" | "channel";
}

export interface JoinedDateDoc {
  date: Date;
  joined: JoinedEntry[];
}

export interface JoinLaterDoc {
  id: number;
  list: number[];
}

// ---------------------------------------------------------------------------
// Models (mirror the exported names from the old db/models.js)
// ---------------------------------------------------------------------------
const channelFields: Field[] = [
  { name: "id", type: "integer", pk: true },
  { name: "name", type: "text" },
  { name: "username", type: "text" },
  { name: "members", type: "integer", default: 0 },
  { name: "fully_scraped", type: "boolean", default: false },
  { name: "last_msg_scraped", type: "integer", default: 0 },
  { name: "groups_scraped", type: "json", default: [] },
  { name: "channels_scraped", type: "json", default: [] },
  { name: "associated_group_name", type: "text" },
  { name: "associated_group_is_member", type: "boolean", default: false },
];

const joinedDateFields: Field[] = [
  { name: "date", type: "date", pk: true },
  { name: "joined", type: "json", default: [] },
];

const joinLaterFields: Field[] = [
  { name: "id", type: "integer", pk: true },
  { name: "list", type: "json", default: [] },
];

const Channel = createModel<ChannelDoc>("channels", channelFields);
const JoinedDate = createModel<JoinedDateDoc>("joined_dates", joinedDateFields);
const JoinLater = createModel<JoinLaterDoc>("join_later", joinLaterFields);

export { Channel, JoinedDate, JoinLater, Collection };
