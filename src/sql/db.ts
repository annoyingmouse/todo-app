import initSqlJs from "@jlongster/sql.js";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend";
import {Task} from "../types/Task";

type SqlStatement = {
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  free(): void;
};
type SqlDatabase = {
  prepare(sql: string): SqlStatement;
  run(sql: string, params?: unknown[]): void;
};
type HandlerMap = {
  GET_TASKS: () => Task[];
  ADD_TASK: (payload: { title: string; completed: number }) => { success: true };
  UPDATE_TASK: (payload: {
    id: number;
    title: string;
    completed: number;
  }) => { success: true };
  DELETE_TASK: (payload: { id: number }) => { success: true };
};
type WorkerRequest =
  | { msgId: number; type: "GET_TASKS"; payload: undefined }
  | { msgId: number; type: "ADD_TASK"; payload: { title: string; completed: number } }
  | { msgId: number; type: "UPDATE_TASK"; payload: { id: number; title: string; completed: number } }
  | { msgId: number; type: "DELETE_TASK"; payload: { id: number } };

let db: SqlDatabase | null = null;

async function init() {
  const SQL = await initSqlJs({ locateFile: (file: string) => `/${file}` });
  const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);
  SQL.FS.mkdir("/sql");
  SQL.FS.mount(sqlFS, {}, "/sql");

  db = new SQL.Database("/sql/tasks.sqlite", { filename: true });

  db!.run(`
    PRAGMA page_size = 4096;
    PRAGMA journal_mode = MEMORY;
  `);
  db!.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    )
  `);
}

const initPromise = init();

const handlers: HandlerMap = {
  GET_TASKS() {
    const stmt = db!.prepare("SELECT * FROM tasks ORDER BY id DESC");
    const result = [];

    while (stmt.step()) {
      const row = stmt.getAsObject() as {
        id: number;
        title: string;
        completed: number;
      };
      result.push({
        ...row,
        completed: row.completed === 1, // normalize
      });
    }

    stmt.free();
    return result;
  },

  ADD_TASK({ title, completed }) {
    db!.run("INSERT INTO tasks (title, completed) VALUES (?, ?)", [
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
    db!.run("UPDATE tasks SET title=?, completed=? WHERE id=?", [
      title,
      completed ? 1 : 0,
      id,
    ]);
    return { success: true };
  },

  DELETE_TASK({ id }: { id: number }) {
    db!.run("DELETE FROM tasks WHERE id=?", [id]);
    return { success: true };
  },
};

self.addEventListener("message", async (e: MessageEvent<WorkerRequest>) => {
  if (!e.data?.msgId) return;
  await initPromise;
  const { type, msgId } = e.data;

  try {
    switch (type) {
      case "GET_TASKS": {
        const result = handlers.GET_TASKS();
        self.postMessage({ msgId, result });
        break;
      }

      case "ADD_TASK": {
        const result = handlers.ADD_TASK(e.data.payload);
        self.postMessage({ msgId, result });
        break;
      }

      case "UPDATE_TASK": {
        const result = handlers.UPDATE_TASK(e.data.payload);
        self.postMessage({ msgId, result });
        break;
      }

      case "DELETE_TASK": {
        const result = handlers.DELETE_TASK(e.data.payload);
        self.postMessage({ msgId, result });
        break;
      }
    }
  } catch (err) {
    self.postMessage({ msgId, error: (err as Error).message });
  }
});
