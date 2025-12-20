import { dbWorker } from "./worker-instance";
const pending = new Map();

dbWorker.onmessage = (e) => {
  // Use dbWorker instead of local worker
  if (!e.data?.msgId) return;
  const { msgId, result, error } = e.data;
  const request = pending.get(msgId);
  if (request) {
    if (error) request.reject(error);
    else request.resolve(result);
    pending.delete(msgId);
  }
};

function send(type: string, payload?: any) {
  const msgId = Math.random().toString(36).slice(2);
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    dbWorker.postMessage({ type, payload, msgId });
  });
}

export const taskApi = {
  getAll: () => send("GET_TASKS"),
  add: (task: { title: string; completed: boolean }) => send("ADD_TASK", task),
  update: (task: { id: number; title: string; completed: boolean }) =>
    send("UPDATE_TASK", task),
  delete: (id: number) => send("DELETE_TASK", { id }),
};
