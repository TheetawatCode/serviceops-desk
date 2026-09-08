import type { JobStatus } from "@/lib/job-types";

export type SlaState = "ON_TRACK" | "AT_RISK" | "BREACHED" | "COMPLETE";

export const SLA_AT_RISK_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Derives the display SLA state from persisted job data. `now` is optional so
 * callers and tests can evaluate the same job at a known point in time.
 */
export function getSlaState(
  dueAt: string | Date,
  status: JobStatus,
  now = new Date(),
): SlaState {
  if (status === "RESOLVED" || status === "CLOSED") return "COMPLETE";

  const remaining = new Date(dueAt).getTime() - now.getTime();
  if (remaining < 0) return "BREACHED";
  if (remaining <= SLA_AT_RISK_WINDOW_MS) return "AT_RISK";
  return "ON_TRACK";
}

export function isActiveSlaRisk(state: SlaState) {
  return state === "BREACHED" || state === "AT_RISK";
}
