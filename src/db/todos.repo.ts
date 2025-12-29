import { getDB } from "./absurder";

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export async function listTodos(): Promise<Todo[]> {
  const db = await getDB();
  const res = await db.execute("SELECT id, title, completed FROM todos");
  console.log(res);
  return (res.rows ?? []).map((r: any) => ({
    id: r[0],
    title: r[1],
    completed: Boolean(r[2]),
  }));
}

export async function addTodo(title: string) {
  const db = await getDB();
  await db.execute(`INSERT INTO todos (title, completed) VALUES ('${title}', 0)`);
  await db.sync();
}

export async function toggleTodo(id: number, completed: boolean) {
  const db = await getDB();
  await db.execute("UPDATE todos SET completed = ? WHERE id = ?", [
    completed ? 1 : 0,
    id,
  ]);
  await db.sync();
}

export async function deleteTodo(id: number) {
  const db = await getDB();
  await db.execute("DELETE FROM todos WHERE id = ?", [id]);
  await db.sync();
}
