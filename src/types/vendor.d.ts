declare module "@jlongster/sql.js/dist/sql-wasm.js" {
  const initSqlJs: any;
  export default initSqlJs;
}

declare module "absurd-sql" {
  export const SQLiteFS: any;
}

declare module "absurd-sql/dist/indexeddb-backend.js" {
  const IndexedDBBackend: any;
  export default IndexedDBBackend;
}
