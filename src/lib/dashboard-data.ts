import { priorityRank } from "@/lib/format";
import type {
  DemoRole,
  JobActivityItem,
  JobStatus,
  PersonSummary,
  Priority,
} from "@/lib/job-types";
import { getSlaState, isActiveSlaRisk, type SlaState } from "@/lib/sla";

export type DashboardJob = {
  id: string;
  reference: string;
  title: string;
  priority: Priority;
  status: JobStatus;
  requesterId: string;
  assigneeId: string | null;
  slaDueAt: string;
  resolvedAt: string | null;
};

export type DashboardActivity = JobActivityItem & {
  job: Pick<DashboardJob, "reference" | "title">;
};

export type DashboardJobWithSla = DashboardJob & { slaState: SlaState };

export type DashboardMetrics = {
  open: number;
  inProgress: number;
  atRisk: number;
  resolvedThisWeek: number;
};

export type TechnicianWorkload = {
  technician: PersonSummary;
  activeJobs: number;
  slaRiskJobs: number;
};

export type PersonalSummary = {
  label: string;
  activeJobs: number;
  slaRiskJobs: number;
};

export function filterDashboardJobsForIdentity(
  jobs: DashboardJob[],
  identity: PersonSummary,
) {
  if (identity.role === "MANAGER") return jobs;
  if (identity.role === "STAFF") {
    return jobs.filter((job) => job.requesterId === identity.id);
  }
  return jobs.filter((job) => job.assigneeId === identity.id);
}

export function withSlaState(jobs: DashboardJob[], now: Date): DashboardJobWithSla[] {
  return jobs.map((job) => ({
    ...job,
    slaState: getSlaState(job.slaDueAt, job.status, now),
  }));
}

function startOfIsoWeek(now: Date) {
  const start = new Date(now);
  const weekday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - weekday);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function getDashboardMetrics(
  jobs: DashboardJobWithSla[],
  now: Date,
): DashboardMetrics {
  const weekStart = startOfIsoWeek(now).getTime();
  const nextWeekStart = weekStart + 7 * 24 * 60 * 60 * 1000;

  return {
    open: jobs.filter((job) => job.status === "OPEN").length,
    inProgress: jobs.filter((job) => job.status === "IN_PROGRESS").length,
    atRisk: jobs.filter((job) => job.slaState === "AT_RISK").length,
    resolvedThisWeek: jobs.filter((job) => {
      if (job.status !== "RESOLVED" || !job.resolvedAt) return false;
      const resolvedAt = new Date(job.resolvedAt).getTime();
      return resolvedAt >= weekStart && resolvedAt < nextWeekStart;
    }).length,
  };
}

export function getAttentionJobs(jobs: DashboardJobWithSla[]) {
  return jobs
    .filter((job) => isActiveSlaRisk(job.slaState))
    .sort((left, right) => {
      const stateRank = left.slaState === "BREACHED" ? 0 : 1;
      const rightStateRank = right.slaState === "BREACHED" ? 0 : 1;
      if (stateRank !== rightStateRank) return stateRank - rightStateRank;
      return new Date(left.slaDueAt).getTime() - new Date(right.slaDueAt).getTime();
    });
}

export function getPriorityQueue(jobs: DashboardJobWithSla[]) {
  return jobs
    .filter((job) => job.status === "OPEN" || job.status === "IN_PROGRESS")
    .sort((left, right) => {
      const priorityDifference = priorityRank[right.priority] - priorityRank[left.priority];
      if (priorityDifference !== 0) return priorityDifference;
      return new Date(left.slaDueAt).getTime() - new Date(right.slaDueAt).getTime();
    })
    .slice(0, 5);
}

export function getTechnicianWorkload(
  technicians: PersonSummary[],
  jobs: DashboardJobWithSla[],
): TechnicianWorkload[] {
  return technicians.map((technician) => {
    const activeJobs = jobs.filter(
      (job) =>
        job.assigneeId === technician.id &&
        (job.status === "OPEN" || job.status === "IN_PROGRESS"),
    );

    return {
      technician,
      activeJobs: activeJobs.length,
      slaRiskJobs: activeJobs.filter((job) => isActiveSlaRisk(job.slaState)).length,
    };
  });
}

export function getPersonalSummary(
  role: DemoRole,
  jobs: DashboardJobWithSla[],
): PersonalSummary {
  const activeJobs = jobs.filter(
    (job) => job.status === "OPEN" || job.status === "IN_PROGRESS",
  );

  return {
    label: role === "STAFF" ? "Jobs you submitted" : "Jobs assigned to you",
    activeJobs: activeJobs.length,
    slaRiskJobs: activeJobs.filter((job) => isActiveSlaRisk(job.slaState)).length,
  };
}
