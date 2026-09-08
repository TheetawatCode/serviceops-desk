import "server-only";

import { prisma } from "@/lib/prisma";
import { seededDemoIdentities } from "@/lib/demo-identities";
import type {
  AssignmentRepository,
  JobCreationPayload,
  JobCreationRepository,
} from "@/lib/job-mutations";

export const jobCreationRepository: JobCreationRepository = {
  async createWithCreatedActivity(payload: JobCreationPayload) {
    await prisma.serviceJob.create({
      data: {
        id: payload.id,
        reference: payload.reference,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        status: payload.status,
        requesterId: payload.requesterId,
        assigneeId: payload.assigneeId,
        slaDueAt: payload.slaDueAt,
        createdAt: payload.createdAt,
        activities: {
          create: {
            id: payload.activity.id,
            authorId: payload.activity.authorId,
            type: payload.activity.type,
            note: payload.activity.note,
            createdAt: payload.activity.createdAt,
          },
        },
      },
    });
  },
};

export const assignmentRepository: AssignmentRepository = {
  async findJob(reference) {
    return prisma.serviceJob.findUnique({
      where: { reference },
      select: {
        id: true,
        status: true,
        assignee: { select: { id: true, name: true } },
      },
    });
  },
  async findTechnician(id) {
    const seededTechnicianIds = seededDemoIdentities
      .filter((identity) => identity.role === "TECHNICIAN")
      .map((identity) => identity.id);

    return prisma.user.findFirst({
      where: {
        id: { equals: id, in: seededTechnicianIds },
        role: "TECHNICIAN",
      },
      select: { id: true, name: true, role: true },
    });
  },
  async assignWithActivity(input) {
    await prisma.$transaction(async (transaction) => {
      await transaction.serviceJob.update({
        where: { id: input.jobId },
        data: { assigneeId: input.assigneeId },
      });
      await transaction.jobActivity.create({
        data: {
          id: input.activityId,
          jobId: input.jobId,
          authorId: input.authorId,
          type: "ASSIGNED",
          fromValue: input.fromValue,
          toValue: input.toValue,
          createdAt: input.createdAt,
        },
      });
    });
  },
};
