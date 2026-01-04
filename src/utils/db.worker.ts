/// <reference lib="webworker" />
import { expose } from "comlink";
import initSqlJs from "@jlongster/sql.js/dist/sql-wasm.js";
import wasmUrl from "@jlongster/sql.js/dist/sql-wasm.wasm?url";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend.js";
import { Task } from "../types/Task";

interface SqlJsStatic {
  FS: {
    mkdir: (path: string) => void;
    mount: (
      fs: unknown,
      options: Record<string, unknown>,
      path: string,
    ) => void;
    mounts: Array<{ mountpoint: string }>;
  };
  register_for_idb: (sqlFS: unknown) => void;
  Database: new () => SqlDatabase;
}

interface CustomWorkerGlobal extends WorkerGlobalScope {
  __idbRegistered?: boolean;
}
const workerSelf = globalThis as unknown as CustomWorkerGlobal;

interface SqlDatabase {
  exec: (sql: string) => void;
  run: (sql: string, params?: unknown[]) => void;
  prepare: (sql: string) => SqlStatement;
}

interface SqlStatement {
  step: () => boolean;
  getAsObject: () => Record<string, unknown>;
  free: () => void;
}

let db: SqlDatabase | null = null;
let initialized = false;

async function initDb(): Promise<void> {
  if (initialized && db) return;

  const SQL = (await initSqlJs({
    locateFile: () => wasmUrl,
  })) as unknown as SqlJsStatic;

  const backend = new IndexedDBBackend();
  const sqlFS = new SQLiteFS(SQL.FS, backend);

  if (!workerSelf.__idbRegistered) {
    SQL.register_for_idb(sqlFS);
    workerSelf.__idbRegistered = true;
  }

  try {
    SQL.FS.mkdir("/sql");
  } catch {
    // Directory already exists
  }

  const mounts = SQL.FS.mounts || [];
  if (!mounts.some((m) => m.mountpoint === "/sql")) {
    SQL.FS.mount(sqlFS, {}, "/sql");
  }

  db = new SQL.Database();

  db.exec(`ATTACH DATABASE '/sql/tasks.sqlite' AS tasks`);
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks.tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);

  initialized = true;
}

const api = {
  async fetchTasks(): Promise<Task[]> {
    await initDb();
    if (!db) throw new Error("Database not initialized");

    const stmt = db.prepare("SELECT * FROM tasks.tasks ORDER BY id DESC");
    const rows: Task[] = [];

    while (stmt.step()) {
      // We cast here because we trust the SQL schema matches our Task interface
      rows.push(stmt.getAsObject() as unknown as Task);
    }
    stmt.free();
    return rows;
  },

  async addTask(title: string): Promise<Task[]> {
    await initDb();
    if (!db) throw new Error("Database not initialized");

    db.run("INSERT INTO tasks.tasks (title, completed) VALUES (?, 0)", [title]);
    return api.fetchTasks();
  },
};

expose(api);
