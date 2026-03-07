import init, { Database } from "@npiesco/absurder-sql";
import { Task } from "../types/Task";

type ColumnValue =
  | { type: "Null" }
  | { type: "Integer"; value: number }
  | { type: "Real"; value: number }
  | { type: "Text"; value: string }
  | { type: "Blob"; value: number[] }
  | { type: "Date"; value: number }
  | { type: "BigInt"; value: string };

type QueryResult = {
  columns: string[];
  rows: { values: ColumnValue[] }[];
  affectedRows: number;
  lastInsertId: number | null;
};

function toParam(val: unknown): ColumnValue {
  if (val === null || val === undefined) return { type: "Null" };
  if (typeof val === "string") return { type: "Text", value: val };
  if (typeof val === "number") {
    return Number.isInteger(val)
      ? { type: "Integer", value: val }
      : { type: "Real", value: val };
  }
  return { type: "Text", value: String(val) };
}

function rowsToTasks(result: QueryResult): Task[] {
  return result.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    result.columns.forEach((col, i) => {
      const val = row.values[i];
      obj[col] =
        val.type === "Null"
          ? null
          : (val as { type: string; value: unknown }).value;
    });
    return {
      ...obj,
      completed: (obj.completed as number) ?? 0,
      dateCompleted: (obj.date_completed as string | null) ?? null,
    } as unknown as Task;
  });
}

let dbPromise: Promise<Database> | null = null;

async function initDb(): Promise<Database> {
  const wasmFetch = await fetch("/absurder_sql_bg.wasm");
  const wasmResponse = new Response(wasmFetch.body, {
    headers: { "Content-Type": "application/wasm" },
  });
  await init({ module_or_path: wasmResponse });
  const database = await Database.newDatabase("tasks.db");
  await database.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);
  try {
    await database.execute(
      "ALTER TABLE tasks ADD COLUMN description TEXT NOT NULL DEFAULT ''",
    );
  } catch {
    // column already exists — safe to ignore
  }
  try {
    await database.execute(
      "ALTER TABLE tasks ADD COLUMN date_completed TEXT",
    );
  } catch {
    // column already exists — safe to ignore
  }
  return database;
}

function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = initDb();
  return dbPromise;
}

async function closeDb(): Promise<void> {
  if (!dbPromise) return;
  const database = await dbPromise;
  dbPromise = null;
  await database.close();
}

export const taskApi = {
  async getAll(): Promise<Task[]> {
    const database = await getDb();
    const result = (await database.execute(
      "SELECT * FROM tasks ORDER BY id DESC",
    )) as QueryResult;
    return rowsToTasks(result);
  },

  async add(task: Omit<Task, "id">): Promise<{ id: number }> {
    const database = await getDb();
    const dateCompleted =
      task.completed === 100 ? new Date().toISOString() : null;
    const result = (await database.executeWithParams(
      "INSERT INTO tasks (title, description, completed, date_completed) VALUES (?, ?, ?, ?)",
      [
        toParam(task.title),
        toParam(task.description),
        toParam(task.completed),
        toParam(dateCompleted),
      ],
    )) as QueryResult;
    await closeDb();
    return { id: result.lastInsertId ?? 0 };
  },

  async update(task: Task): Promise<void> {
    const database = await getDb();
    const dateCompleted =
      task.completed === 100
        ? (task.dateCompleted ?? new Date().toISOString())
        : null;
    await database.executeWithParams(
      "UPDATE tasks SET title=?, description=?, completed=?, date_completed=? WHERE id=?",
      [
        toParam(task.title),
        toParam(task.description),
        toParam(task.completed),
        toParam(dateCompleted),
        toParam(task.id),
      ],
    );
    await closeDb();
  },

  async delete(id: number): Promise<void> {
    const database = await getDb();
    await database.executeWithParams("DELETE FROM tasks WHERE id=?", [
      toParam(id),
    ]);
    await closeDb();
  },
};
