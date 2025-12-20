export const dbWorker = new Worker(new URL("./db.ts", import.meta.url), {
  type: "module",
});
