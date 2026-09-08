import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  getAttentionJobs,
  getDashboardMetrics,
  getPersonalSummary,
  getPriorityQueue,
  getTechnicianWorkload,
  withSlaState,
  type DashboardActivity,
  type DashboardJob,
} from "@/lib/dashboard-data";
import { prisma } from "@/lib/prisma";
import { seededDemoIdentities } from "@/lib/demo-identities";
import type { PersonSummary } from "@/lib/job-types";

const personSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

function dashboardScopeFor(identity: PersonSummary): Prisma.ServiceJobWhereInput {
  if (identity.role === "MANAGER") return {};
  if (identity.role === "STAFF") return { requesterId: identity.id };
  return { assigneeId: identity.id };
}

export type DashboardData = {
  metrics: ReturnType<typeof getDashboardMetrics>;
  attentionJobs: ReturnType<typeof getAttentionJobs>;
  priorityQueue: ReturnType<typeof getPriorityQueue>;
  recentActivity: DashboardActivity[];
  workload: ReturnType<typeof getTechnicianWorkload> | null;
  personalSummary: ReturnType<typeof getPersonalSummary> | null;
};

export async function getDashboardForIdentity(
  identity: PersonSummary,
  now = new Date(),
): Promise<DashboardData> {
  const scope = dashboardScopeFor(identity);
  const [jobs, activities, technicians] = await Promise.all([
    prisma.serviceJob.findMany({
      where: scope,
      select: {
        id: true,
        reference: true,
        title: true,
        priority: true,
        status: true,
        requesterId: true,
        assigneeId: true,
        slaDueAt: true,
        resolvedAt: true,
      },
    }),
    prisma.jobActivity.findMany({
      where: { job: scope },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        author: { select: personSelect },
        job: { select: { reference: true, title: true } },
      },
    }),
    identity.role === "MANAGER"
      ? prisma.user.findMany({
          where: {
            id: {
              in: seededDemoIdentities
                .filter((demoIdentity) => demoIdentity.role === "TECHNICIAN")
                .map((demoIdentity) => demoIdentity.id),
            },
            role: "TECHNICIAN",
          },
          orderBy: { name: "asc" },
          select: personSelect,
        })
      : Promise.resolve([]),
  ]);

  const serialisedJobs: DashboardJob[] = jobs.map((job) => ({
    ...job,
    slaDueAt: job.slaDueAt.toISOString(),
    resolvedAt: job.resolvedAt?.toISOString() ?? null,
  }));
  const scopedJobs = withSlaState(serialisedJobs, now);
  const recentActivity: DashboardActivity[] = activities.map((activity) => ({
    ...activity,
    createdAt: activity.createdAt.toISOString(),
  }));

  return {
    metrics: getDashboardMetrics(scopedJobs, now),
    attentionJobs: getAttentionJobs(scopedJobs),
    priorityQueue: getPriorityQueue(scopedJobs),
    recentActivity,
    workload:
      identity.role === "MANAGER"
        ? getTechnicianWorkload(technicians, scopedJobs)
        : null,
    personalSummary:
      identity.role === "MANAGER" ? null : getPersonalSummary(identity.role, scopedJobs),
  };
}
