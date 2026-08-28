import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

/**
 * Offline write queue.
 *
 * Game day happens in buildings with no signal, which is exactly when the app
 * matters most. Every write the athlete makes lands here first and is applied
 * to Supabase when there's a connection. Nothing in the routine runner, the
 * reset, or the debrief ever awaits the network.
 *
 * Each entry carries a client-generated uuid used as the row's primary key, so
 * a retry after a response we never saw upserts the same row instead of
 * creating a duplicate.
 */

/**
 * `upsert` writes a whole row and is the default. `patch` updates named
 * columns on a row that already exists.
 *
 * The distinction matters: PostgREST builds an upsert as
 * `INSERT ... ON CONFLICT (id) DO UPDATE`, and Postgres checks NOT NULL while
 * forming the tuple — before conflict detection. So upserting `{id, status}`
 * against `games` fails on `athlete_id` even though the row is already there.
 * Anything that changes a couple of columns has to be a patch.
 */
type OpMode = "upsert" | "patch";

type Op = {
  id: string;
  table: string;
  mode: OpMode;
  payload: Record<string, unknown>;
  attempts: number;
};

let db: SQLite.SQLiteDatabase | null = null;
let flushing = false;

export const outbox = {
  async init() {
    db = await SQLite.openDatabaseAsync("gameday.db");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS outbox (
        id        TEXT PRIMARY KEY NOT NULL,
        tbl       TEXT NOT NULL,
        mode      TEXT NOT NULL DEFAULT 'upsert',
        payload   TEXT NOT NULL,
        attempts  INTEGER NOT NULL DEFAULT 0,
        queued_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cache (
        key       TEXT PRIMARY KEY NOT NULL,
        value     TEXT NOT NULL,
        stored_at INTEGER NOT NULL
      );
    `);
    // Anything left from a previous session goes out as soon as we're up.
    void outbox.flush();
  },

  /** A stable id to use as the row's primary key before it ever reaches the server. */
  newId(): string {
    return Crypto.randomUUID();
  },

  /**
   * Queues a write and tries immediately. Returns once it's durably queued —
   * not once the server has it, which is the point.
   */
  async enqueue(
    table: string,
    payload: Record<string, unknown>,
    mode: OpMode = "upsert",
  ) {
    if (!db) await outbox.init();
    const id = (payload.id as string) ?? outbox.newId();
    const row = { ...payload, id };

    // Keyed by table, id, and mode so a patch queued behind a full write of
    // the same row doesn't overwrite it — they're different intentions.
    await db!.runAsync(
      "INSERT OR REPLACE INTO outbox (id, tbl, mode, payload, attempts, queued_at) VALUES (?, ?, ?, ?, 0, ?)",
      [`${table}:${id}:${mode}`, table, mode, JSON.stringify(row), Date.now()],
    );

    void outbox.flush();
    return id;
  },

  async pending(): Promise<number> {
    if (!db) return 0;
    const r = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) as n FROM outbox");
    return r?.n ?? 0;
  },

  async flush() {
    if (flushing || !db) return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) return; // Nothing to write against yet.

    flushing = true;
    try {
      const rows = await db.getAllAsync<{
        id: string;
        tbl: string;
        mode: string;
        payload: string;
        attempts: number;
      }>(
        "SELECT id, tbl, mode, payload, attempts FROM outbox ORDER BY queued_at ASC LIMIT 50",
      );

      for (const row of rows) {
        let op: Op;
        try {
          op = {
            id: row.id,
            table: row.tbl,
            mode: row.mode === "patch" ? "patch" : "upsert",
            payload: JSON.parse(row.payload),
            attempts: row.attempts,
          };
        } catch {
          // Unparseable entry — it can never succeed, so drop it rather than
          // block everything queued behind it.
          await db.runAsync("DELETE FROM outbox WHERE id = ?", [row.id]);
          continue;
        }

        const { id: rowId, ...columns } = op.payload as { id: string } & Record<
          string,
          unknown
        >;

        const { error } =
          op.mode === "patch"
            ? await supabase
                .from(op.table as never)
                .update(columns as never)
                .eq("id", rowId)
            : await supabase
                .from(op.table as never)
                .upsert(op.payload as never, { onConflict: "id" });

        if (!error) {
          await db.runAsync("DELETE FROM outbox WHERE id = ?", [row.id]);
          continue;
        }

        // A constraint or permission failure will never succeed on retry;
        // a network failure will. Give up after ten tries either way so a
        // poison entry can't wedge the queue forever.
        const attempts = op.attempts + 1;
        if (attempts >= 10) {
          console.warn(`[outbox] dropping ${row.id} after ${attempts} attempts: ${error.message}`);
          await db.runAsync("DELETE FROM outbox WHERE id = ?", [row.id]);
        } else {
          await db.runAsync("UPDATE outbox SET attempts = ? WHERE id = ?", [attempts, row.id]);
          // Stop the sweep — if one write is failing on connectivity, the rest
          // will too, and hammering them all burns battery for nothing.
          break;
        }
      }
    } finally {
      flushing = false;
    }
  },
};

/* ── Content cache ──────────────────────────────────────────────────────── */

/** Drills, audio manifests, and upcoming games, kept for offline reads. */
export const cache = {
  async set(key: string, value: unknown) {
    if (!db) await outbox.init();
    await db!.runAsync(
      "INSERT OR REPLACE INTO cache (key, value, stored_at) VALUES (?, ?, ?)",
      [key, JSON.stringify(value), Date.now()],
    );
  },

  async get<T>(key: string): Promise<T | null> {
    if (!db) await outbox.init();
    const row = await db!.getFirstAsync<{ value: string }>(
      "SELECT value FROM cache WHERE key = ?",
      [key],
    );
    if (!row) return null;
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return null;
    }
  },
};
