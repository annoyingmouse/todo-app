declare module "@jlongster/sql.js" {
  export interface SqlJsStatic {
    // Add minimal properties you use, or keep as unknown record
    Database: new (
      data?: Uint8Array,
    ) => unknown;
    FS: unknown;
    register_for_idb: (sqlFS: unknown) => void;
  }

  const initSqlJs: (config: {
    locateFile?: (file: string) => string;
  }) => Promise<SqlJsStatic>;

  export default initSqlJs;
}

declare module "absurd-sql" {
  // SQLiteFS is used as a constructor: new SQLiteFS(SQL.FS, backend)
  export const SQLiteFS: new (fs: unknown, backend: unknown) => unknown;
}

declare module "absurd-sql/dist/indexeddb-main-thread" {
  export function initBackend(worker: Worker): void;
}

declare module "absurd-sql/dist/indexeddb-backend" {
  // This is usually exported as a class
  const IndexedDBBackend: new () => unknown;
  export default IndexedDBBackend;
}
