import init, { Database } from "@npiesco/absurder-sql";
import { Task } from "../types/Task";
import type { KanbanStatus } from "../types/Task";

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

function derivedStatus(completed: number): KanbanStatus {
  if (completed === 100) return "done";
  if (completed === 0) return "backlog";
  return "in-progress";
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
    const completed = (obj.completed as number) ?? 0;
    return {
      ...obj,
      completed,
      dateCompleted: (obj.date_completed as string | null) ?? null,
      parentId: (obj.parent_id as number | null) ?? null,
      deletedAt: (obj.deleted_at as string | null) ?? null,
      status: ((obj.status as string) ?? derivedStatus(completed)) as KanbanStatus,
      collapsed: Boolean((obj.collapsed as number) ?? 0),
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
    await database.execute("ALTER TABLE tasks ADD COLUMN date_completed TEXT");
  } catch {
    // column already exists — safe to ignore
  }
  try {
    await database.execute(
      "ALTER TABLE tasks ADD COLUMN parent_id INTEGER REFERENCES tasks(id)",
    );
  } catch {
    // column already exists — safe to ignore
  }
  try {
    await database.execute("ALTER TABLE tasks ADD COLUMN deleted_at TEXT");
  } catch {
    // column already exists — safe to ignore
  }
  try {
    await database.execute(
      "ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'backlog'",
    );
    // Migrate existing tasks based on their completion percentage
    await database.execute(
      "UPDATE tasks SET status = 'done' WHERE completed = 100 AND status = 'backlog'",
    );
    await database.execute(
      "UPDATE tasks SET status = 'in-progress' WHERE completed > 0 AND completed < 100 AND status = 'backlog'",
    );
  } catch {
    // column already exists — safe to ignore
  }
  try {
    await database.execute(
      "ALTER TABLE tasks ADD COLUMN collapsed INTEGER NOT NULL DEFAULT 0",
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
      "SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY id DESC",
    )) as QueryResult;
    return rowsToTasks(result);
  },

  async add(task: Omit<Task, "id">): Promise<{ id: number }> {
    const database = await getDb();
    const dateCompleted =
      task.completed === 100 ? new Date().toISOString() : null;
    const result = (await database.executeWithParams(
      "INSERT INTO tasks (title, description, completed, date_completed, parent_id, status, collapsed) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        toParam(task.title),
        toParam(task.description),
        toParam(task.completed),
        toParam(dateCompleted),
        toParam(task.parentId ?? null),
        toParam(task.status ?? "backlog"),
        toParam(task.collapsed ? 1 : 0),
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
      "UPDATE tasks SET title=?, description=?, completed=?, date_completed=?, status=?, collapsed=? WHERE id=?",
      [
        toParam(task.title),
        toParam(task.description),
        toParam(task.completed),
        toParam(dateCompleted),
        toParam(task.status ?? "backlog"),
        toParam(task.collapsed ? 1 : 0),
        toParam(task.id),
      ],
    );
    await closeDb();
  },

  async delete(id: number): Promise<void> {
    const database = await getDb();
    const now = new Date().toISOString();
    await database.executeWithParams(
      `WITH RECURSIVE subtree(id) AS (
        SELECT id FROM tasks WHERE id=?
        UNION ALL
        SELECT t.id FROM tasks t INNER JOIN subtree s ON t.parent_id=s.id
      )
      UPDATE tasks SET deleted_at=? WHERE id IN (SELECT id FROM subtree)`,
      [toParam(id), toParam(now)],
    );
    await closeDb();
  },

  async getDeleted(): Promise<Task[]> {
    const database = await getDb();
    const result = (await database.execute(
      "SELECT * FROM tasks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC",
    )) as QueryResult;
    return rowsToTasks(result);
  },

  async restore(id: number): Promise<void> {
    const database = await getDb();
    // Restore all descendants (the task + its entire subtree)
    await database.executeWithParams(
      `WITH RECURSIVE subtree(id) AS (
        SELECT id FROM tasks WHERE id=?
        UNION ALL
        SELECT t.id FROM tasks t INNER JOIN subtree s ON t.parent_id=s.id
      )
      UPDATE tasks SET deleted_at=NULL WHERE id IN (SELECT id FROM subtree)`,
      [toParam(id)],
    );
    // Also restore all ancestors that were deleted
    await database.executeWithParams(
      `WITH RECURSIVE ancestors(id, parent_id) AS (
        SELECT id, parent_id FROM tasks WHERE id=?
        UNION ALL
        SELECT t.id, t.parent_id FROM tasks t INNER JOIN ancestors a ON t.id=a.parent_id
      )
      UPDATE tasks SET deleted_at=NULL WHERE id IN (SELECT id FROM ancestors)`,
      [toParam(id)],
    );
    await closeDb();
  },

  async permanentDelete(id: number): Promise<void> {
    const database = await getDb();
    await database.executeWithParams(
      `WITH RECURSIVE subtree(id) AS (
        SELECT id FROM tasks WHERE id=?
        UNION ALL
        SELECT t.id FROM tasks t INNER JOIN subtree s ON t.parent_id=s.id
      )
      DELETE FROM tasks WHERE id IN (SELECT id FROM subtree)`,
      [toParam(id)],
    );
    await closeDb();
  },

  async exportAll(): Promise<Task[]> {
    const database = await getDb();
    const result = (await database.execute(
      "SELECT * FROM tasks ORDER BY id ASC",
    )) as QueryResult;
    return rowsToTasks(result);
  },

  async importAll(tasks: Task[]): Promise<void> {
    const database = await getDb();
    await database.execute("DELETE FROM tasks");
    for (const task of tasks) {
      const status =
        task.status ??
        (task.completed === 100
          ? "done"
          : task.completed > 0
            ? "in-progress"
            : "backlog");
      await database.executeWithParams(
        "INSERT INTO tasks (id, title, description, completed, date_completed, parent_id, deleted_at, status, collapsed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          toParam(task.id),
          toParam(task.title),
          toParam(task.description),
          toParam(task.completed),
          toParam(task.dateCompleted),
          toParam(task.parentId),
          toParam(task.deletedAt),
          toParam(status),
          toParam(task.collapsed ? 1 : 0),
        ],
      );
    }
    await closeDb();
  },
};
