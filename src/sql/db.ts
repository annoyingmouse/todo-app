import initSqlJs from "@jlongster/sql.js";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend";

let db: any;

async function init() {
  const SQL = await initSqlJs({ locateFile: (file: never) => `/${file}` });
  const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);
  SQL.FS.mkdir("/sql");
  SQL.FS.mount(sqlFS, {}, "/sql");

  db = new SQL.Database("/sql/tasks.sqlite", { filename: true });

  db.run(`
    PRAGMA page_size = 4096;
    PRAGMA journal_mode = MEMORY;
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    )
  `);
}

const initPromise = init();

const handlers = {
  GET_TASKS() {
    const stmt = db.prepare("SELECT * FROM tasks ORDER BY id DESC");
    const result = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      result.push({
        ...row,
        completed: row.completed === 1, // normalize
      });
    }

    stmt.free();
    return result;
  },

  ADD_TASK({ title, completed }: { title: string; completed: number }) {
    db.run("INSERT INTO tasks (title, completed) VALUES (?, ?)", [
      title,
      completed ? 1 : 0,
    ]);
    return { success: true };
  },

  UPDATE_TASK({
    id,
    title,
    completed,
  }: {
    id: number;
    title: string;
    completed: number;
  }) {
    db.run("UPDATE tasks SET title=?, completed=? WHERE id=?", [
      title,
      completed ? 1 : 0,
      id,
    ]);
    return { success: true };
  },

  DELETE_TASK({ id }: { id: number }) {
    db.run("DELETE FROM tasks WHERE id=?", [id]);
    return { success: true };
  },
};

self.addEventListener("message", async (e) => {
  if (!e.data || !e.data.msgId) return;
  await initPromise;
  const { type, payload, msgId } = e.data;

  try {
    const handler = handlers[type];
    if (!handler) {
      throw new Error(`Unknown action type: ${type}`);
    }
    const result = handler(payload);
    self.postMessage({ msgId, result });
  } catch (err) {
    console.error("Worker SQL Error:", err); // Log the actual error
    self.postMessage({ msgId, error: err?.message });
  }
});
