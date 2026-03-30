import type { KanbanStatus } from "../types/Task";

export function statusFromPct(pct: number): KanbanStatus {
  if (pct === 100) return "done";
  if (pct === 0) return "backlog";
  return "in-progress";
}

export function pctFromStatus(status: KanbanStatus, currentPct: number): number {
  if (status === "done") return 100;
  if (status === "backlog") return 0;
  return currentPct > 0 && currentPct < 100 ? currentPct : 50;
}
