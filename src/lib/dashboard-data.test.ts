import { describe, expect, it } from "vitest";

import {
  filterDashboardJobsForIdentity,
  getAttentionJobs,
  getDashboardMetrics,
  getPersonalSummary,
  getPriorityQueue,
  getTechnicianWorkload,
  withSlaState,
  type DashboardJob,
} from "@/lib/dashboard-data";
import type { PersonSummary } from "@/lib/job-types";

const now = new Date("2026-09-08T02:00:00.000Z");

const manager: PersonSummary = {
  id: "manager",
  name: "Ananda",
  email: "manager@example.test",
  role: "MANAGER",
};
const staff: PersonSummary = {
  id: "staff",
  name: "Mina",
  email: "staff@example.test",
  role: "STAFF",
};
const technician: PersonSummary = {
  id: "tech",
  name: "Narin",
  email: "tech@example.test",
  role: "TECHNICIAN",
};
const secondTechnician: PersonSummary = {
  id: "tech-2",
  name: "Pim",
  email: "pim@example.test",
  role: "TECHNICIAN",
};

const jobs: DashboardJob[] = [
  {
    id: "open-risk",
    reference: "SVC-1",
    title: "Open at risk",
    priority: "URGENT",
    status: "OPEN",
    requesterId: "staff",
    assigneeId: "tech",
    slaDueAt: "2026-09-08T08:00:00.000Z",
    resolvedAt: null,
  },
  {
    id: "progress-breached",
    reference: "SVC-2",
    title: "In progress breached",
    priority: "HIGH",
    status: "IN_PROGRESS",
    requesterId: "manager",
    assigneeId: "tech",
    slaDueAt: "2026-09-08T01:59:59.000Z",
    resolvedAt: null,
  },
  {
    id: "open-track",
    reference: "SVC-3",
    title: "Open on track",
    priority: "LOW",
    status: "OPEN",
    requesterId: "manager",
    assigneeId: "tech-2",
    slaDueAt: "2026-09-10T02:00:01.000Z",
    resolvedAt: null,
  },
  {
    id: "resolved",
    reference: "SVC-4",
    title: "Resolved this week",
    priority: "MEDIUM",
    status: "RESOLVED",
    requesterId: "staff",
    assigneeId: "tech",
    slaDueAt: "2026-09-01T02:00:00.000Z",
    resolvedAt: "2026-09-08T01:00:00.000Z",
  },
  {
    id: "closed",
    reference: "SVC-5",
    title: "Closed job",
    priority: "URGENT",
    status: "CLOSED",
    requesterId: "staff",
    assigneeId: "tech",
    slaDueAt: "2026-09-01T02:00:00.000Z",
    resolvedAt: "2026-09-08T01:30:00.000Z",
  },
];

describe("dashboard data", () => {
  it("scopes persisted jobs for each server-resolved role", () => {
    expect(filterDashboardJobsForIdentity(jobs, manager)).toHaveLength(5);
    expect(filterDashboardJobsForIdentity(jobs, staff).map((job) => job.id)).toEqual([
      "open-risk",
      "resolved",
      "closed",
    ]);
    expect(filterDashboardJobsForIdentity(jobs, technician).map((job) => job.id)).toEqual([
      "open-risk",
      "progress-breached",
      "resolved",
      "closed",
    ]);
  });

  it("derives metrics while excluding completed jobs from active SLA risk", () => {
    const jobsWithSla = withSlaState(jobs, now);

    expect(getDashboardMetrics(jobsWithSla, now)).toEqual({
      open: 2,
      inProgress: 1,
      atRisk: 1,
      resolvedThisWeek: 1,
    });
    expect(getAttentionJobs(jobsWithSla).map((job) => job.id)).toEqual([
      "progress-breached",
      "open-risk",
    ]);
    expect(jobsWithSla.find((job) => job.id === "closed")?.slaState).toBe("COMPLETE");
  });

  it("prioritises urgent active work before lower priority work", () => {
    expect(getPriorityQueue(withSlaState(jobs, now)).map((job) => job.id)).toEqual([
      "open-risk",
      "progress-breached",
      "open-track",
    ]);
  });

  it("aggregates active and SLA-risk workloads for every seeded technician", () => {
    expect(getTechnicianWorkload([technician, secondTechnician], withSlaState(jobs, now))).toEqual([
      { technician, activeJobs: 2, slaRiskJobs: 2 },
      { technician: secondTechnician, activeJobs: 1, slaRiskJobs: 0 },
    ]);
  });

  it("provides a concise scoped personal summary", () => {
    expect(getPersonalSummary("STAFF", withSlaState(jobs.slice(0, 1), now))).toEqual({
      label: "Jobs you submitted",
      activeJobs: 1,
      slaRiskJobs: 1,
    });
    expect(getPersonalSummary("TECHNICIAN", withSlaState([], now))).toEqual({
      label: "Jobs assigned to you",
      activeJobs: 0,
      slaRiskJobs: 0,
    });
  });
});
