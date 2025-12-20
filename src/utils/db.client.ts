// src/utils/db.ts (or wherever wrap() lives)
import { wrap } from "comlink";
import DbWorker from "./db.worker?worker";
import type { DbApi } from "./db.types";

const worker = new DbWorker();
export const db = wrap<DbApi>(worker);
