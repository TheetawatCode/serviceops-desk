import type { Priority } from "@/lib/job-types";
export { getSlaState, type SlaState } from "@/lib/sla";

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
