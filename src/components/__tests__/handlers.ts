import { http, HttpResponse } from "msw";

let tasks = [
  { id: 1, title: "Learn Testing", completed: false },
  { id: 2, title: "hello", completed: false },
];

export const handlers = [
  http.get("http://localhost:3001/tasks", () => {
    return HttpResponse.json(tasks);
  }),

  http.post("http://localhost:3001/tasks", async ({ request }) => {
    const body = (await request.json()) as {
      title: string;
      completed: boolean;
    };
    const newTask = { id: Date.now(), ...body };
    tasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.delete("http://localhost:3001/tasks/:id", ({ params }) => {
    const id = Number(params.id);
    tasks = tasks.filter((t) => t.id !== id);
    return HttpResponse.json({ success: true });
  }),
];
