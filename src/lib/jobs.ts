import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { JobDetail, JobListItem, PersonSummary } from "@/lib/job-types";

const personSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

function jobScopeFor(identity: PersonSummary): Prisma.ServiceJobWhereInput {
  if (identity.role === "MANAGER") return {};
  if (identity.role === "STAFF") return { requesterId: identity.id };
  return { assigneeId: identity.id };
}

export async function getJobsForIdentity(
  identity: PersonSummary,
): Promise<JobListItem[]> {
  const jobs = await prisma.serviceJob.findMany({
    where: jobScopeFor(identity),
    orderBy: [{ priority: "desc" }, { slaDueAt: "asc" }],
    include: {
      requester: { select: personSelect },
      assignee: { select: personSelect },
    },
  });

  return jobs.map((job) => ({
    ...job,
    slaDueAt: job.slaDueAt.toISOString(),
    createdAt: job.createdAt.toISOString(),
  }));
}

export async function getJobForIdentity(
  reference: string,
  identity: PersonSummary,
): Promise<JobDetail | null> {
  const job = await prisma.serviceJob.findFirst({
    where: { reference, ...jobScopeFor(identity) },
    include: {
      requester: { select: personSelect },
      assignee: { select: personSelect },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: personSelect } },
      },
    },
  });

  if (!job) return null;

  return {
    ...job,
    slaDueAt: job.slaDueAt.toISOString(),
    createdAt: job.createdAt.toISOString(),
    resolvedAt: job.resolvedAt?.toISOString() ?? null,
    closedAt: job.closedAt?.toISOString() ?? null,
    activities: job.activities.map((activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
    })),
  };
}
