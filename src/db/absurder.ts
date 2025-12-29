import init, { Database } from "@npiesco/absurder-sql";

let dbPromise: Promise<Database> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = (async () => {
      // WASM init (must be awaited exactly once)
      await init();

      // Open or create DB (IndexedDB-backed)
      const db = await Database.newDatabase("todos");

      // Schema
      await db.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed INTEGER NOT NULL
        );
      `);

      // Persist schema
      await db.sync();

      return db;
    })();
  }

  return dbPromise;
}
