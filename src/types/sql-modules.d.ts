declare module "@jlongster/sql.js" {
  const initSqlJs: (config: {
    locateFile?: (file: string) => string;
  }) => Promise<any>;
  export default initSqlJs;
}

declare module "absurd-sql" {
  export const SQLiteFS: any;
}

declare module "absurd-sql/dist/indexeddb-main-thread" {
  export function initBackend(worker: Worker): void;
}

declare module "absurd-sql/dist/indexeddb-backend" {
  const IndexedDBBackend: any;
  export default IndexedDBBackend;
}