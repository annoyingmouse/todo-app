import type { KanbanStatus } from "../types/Task";

// Used for migration/import only — derives status purely from a completion value.
export function statusFromPct(pct: number): KanbanStatus {
  if (pct === 100) return "done";
  if (pct === 0) return "backlog";
  return "in-progress";
}

// Used when the completion slider changes. Only 100% forces a status change;
// below 100% the existing status is preserved (in-progress can sit at 0%).
// The one exception: a task cannot remain "done" below 100%.
export function statusFromSlider(
  pct: number,
  currentStatus: KanbanStatus,
): KanbanStatus {
  if (pct === 100) return "done";
  if (currentStatus === "done") return "in-progress";
  return currentStatus;
}

export function pctFromStatus(status: KanbanStatus, currentPct: number): number {
  if (status === "done") return 100;
  if (status === "backlog") return 0;
  // in-progress: keep current value unless it was 100 (can't be done and in-progress)
  return currentPct < 100 ? currentPct : 50;
}
