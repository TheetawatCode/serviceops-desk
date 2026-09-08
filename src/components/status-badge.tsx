import { AlertTriangle, CheckCircle2, Circle, Clock3 } from "lucide-react";

import { getSlaState, humanize, type SlaState } from "@/lib/format";
import type { JobStatus } from "@/lib/job-types";

const statusStyles: Record<JobStatus, string> = {
  OPEN: "badge-neutral",
  IN_PROGRESS: "badge-info",
  RESOLVED: "badge-success",
  CLOSED: "badge-neutral",
};

const slaStyles: Record<SlaState, string> = {
  ON_TRACK: "badge-success",
  AT_RISK: "badge-warning",
  BREACHED: "badge-danger",
  COMPLETE: "badge-neutral",
};

function BadgeIcon({ value }: { value: string }) {
  if (value === "BREACHED" || value === "AT_RISK") {
    return <AlertTriangle size={13} aria-hidden="true" />;
  }
  if (value === "RESOLVED" || value === "COMPLETE") {
    return <CheckCircle2 size={13} aria-hidden="true" />;
  }
  if (value === "IN_PROGRESS") return <Clock3 size={13} aria-hidden="true" />;
  return <Circle size={12} aria-hidden="true" />;
}

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`badge ${statusStyles[status]}`}>
      <BadgeIcon value={status} />
      {humanize(status)}
    </span>
  );
}

export function SlaBadge({ dueAt, status }: { dueAt: string; status: JobStatus }) {
  const state = getSlaState(dueAt, status);
  return (
    <span className={`badge ${slaStyles[state]}`}>
      <BadgeIcon value={state} />
      {humanize(state)}
    </span>
  );
}
