import { dbWorker } from "./worker-instance";
import { Task } from "../types/Task";

type Deferred<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

// We use 'any' here because the Map holds mixed response types.
// This is one of the few places where 'any' is architecturally necessary
// unless using a complex discriminated union.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pending = new Map<string, Deferred<any>>();

dbWorker.onmessage = (e: MessageEvent) => {
  if (!e.data?.msgId) return;
  const { msgId, result, error } = e.data;
  const request = pending.get(msgId);

  if (request) {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(result);
    }
    pending.delete(msgId);
  }
};

function send<T>(type: string, payload?: unknown): Promise<T> {
  const msgId = Math.random().toString(36).slice(2);
  return new Promise<T>((resolve, reject) => {
    // TypeScript allows this because T satisfies the 'any' in the Map
    pending.set(msgId, { resolve, reject });
    dbWorker.postMessage({ type, payload, msgId });
  });
}

export const taskApi = {
  getAll: () => send<Task[]>("GET_TASKS"),
  add: (task: Omit<Task, "id">) => send<{ id: number }>("ADD_TASK", task),
  update: (task: Task) => send<void>("UPDATE_TASK", task),
  delete: (id: number) => send<void>("DELETE_TASK", { id }),
};
