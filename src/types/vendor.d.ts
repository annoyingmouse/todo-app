declare module "@jlongster/sql.js/dist/sql-wasm.js" {
  export interface SqlJsConfig {
    locateFile?: (path: string) => string;
  }

  // sql.js returns a Promise that resolves to the SQL object
  const initSqlJs: (config?: SqlJsConfig) => Promise<unknown>;
  export default initSqlJs;
}

declare module "absurd-sql" {
  // SQLiteFS is usually passed as a class or object to sql.js
  export const SQLiteFS: new (...args: unknown[]) => unknown;
}

declare module "absurd-sql/dist/indexeddb-backend.js" {
  // The backend is typically a class used for persistent storage
  const IndexedDBBackend: new (...args: unknown[]) => unknown;
  export default IndexedDBBackend;
}

declare module "absurd-sql/dist/indexeddb-backend.js" {
  export default class IndexedDBBackend {
    constructor();
  }
}

declare module "absurd-sql" {
  export class SQLiteFS {
    constructor(fs: unknown, backend: unknown);
  }
}