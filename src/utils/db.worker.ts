self.addEventListener("error", (e) => {
  // @ts-ignore
  console.error("WORKER ERROR EVENT:", e.message, e);
});

self.addEventListener("unhandledrejection", (e) => {
  console.error("WORKER UNHANDLED REJECTION:", e.reason);
});

/// <reference lib="webworker" />

import { expose } from "comlink";
import initSqlJs from "@jlongster/sql.js/dist/sql-wasm.js";
import wasmUrl from "@jlongster/sql.js/dist/sql-wasm.wasm?url";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend.js";

console.log("WORKER FILE EXECUTED");

let db: any;
let initialized = false;

async function initDb() {
  if (initialized) return;

  console.log("INITIALIZING DB");

  const SQL = await initSqlJs({
    locateFile: () => wasmUrl,
  });

  console.log("SQL LOADED");

  const backend = new IndexedDBBackend();
  const sqlFS = new SQLiteFS(SQL.FS, backend);

  if (!(self as any).__idbRegistered) {
    SQL.register_for_idb(sqlFS);
    (self as any).__idbRegistered = true;
  }

  try {
    SQL.FS.mkdir("/sql");
  } catch {}

  const mounts = (SQL.FS as any).mounts || [];
  if (!mounts.some((m: any) => m.mountpoint === "/sql")) {
    SQL.FS.mount(sqlFS, {}, "/sql");
  }

  db = new SQL.Database();
  console.log("Opened in-memory DB");

  db.exec(`ATTACH DATABASE '/sql/tasks.sqlite' AS tasks`);
  console.log("Attached file-backed DB");

  db.run(`
  CREATE TABLE IF NOT EXISTS tasks.tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

  initialized = true;
  console.log("CREATED TABLE");
}

const api = {
  async fetchTasks() {
    console.log("fetchTasks ENTERED");
    await initDb();

    const stmt = db.prepare("SELECT * FROM tasks.tasks ORDER BY id DESC");

    const rows: any[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  },

  async addTask(title: string) {
    await initDb();
    db.run("INSERT INTO tasks.tasks (title, completed) VALUES (?, 0)", [title]);
    return api.fetchTasks();
  },
};

console.log("ABOUT TO EXPOSE API");
expose(api);
