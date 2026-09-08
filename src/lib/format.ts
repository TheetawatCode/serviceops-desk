import type { JobStatus, Priority } from "@/lib/job-types";

export type SlaState = "ON_TRACK" | "AT_RISK" | "BREACHED" | "COMPLETE";

export function getSlaState(
  dueAt: string,
  status: JobStatus,
  now = new Date(),
): SlaState {
  if (status === "RESOLVED" || status === "CLOSED") return "COMPLETE";

  const remaining = new Date(dueAt).getTime() - now.getTime();
  if (remaining < 0) return "BREACHED";
  if (remaining <= 4 * 60 * 60 * 1000) return "AT_RISK";
  return "ON_TRACK";
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const priorityRank: Record<Priority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};
