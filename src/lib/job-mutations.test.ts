import { describe, expect, it, vi } from "vitest";

import { seededDemoIdentities } from "@/lib/demo-identities";
import {
  addInternalWorkNote,
  assignServiceJob,
  createServiceJob,
  transitionServiceJobStatus,
  type AssignmentRepository,
  type InternalNoteRepository,
  type JobCreationRepository,
  type StatusTransitionRepository,
} from "@/lib/job-mutations";

const manager = seededDemoIdentities[0];
const technician = seededDemoIdentities[1];
const staff = seededDemoIdentities[2];
const now = new Date("2026-09-09T03:00:00.000Z");

function validCreationForm(overrides: Record<string, string> = {}) {
  const values = {
    title: "Laptop cannot connect to office Wi-Fi",
    description: "The laptop loses the office Wi-Fi connection every few minutes after a system update.",
    category: "HARDWARE",
    priority: "HIGH",
    ...overrides,
  };
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("createServiceJob", () => {
  it("validates fields before writing a job", async () => {
    const repository: JobCreationRepository = {
      createWithCreatedActivity: vi.fn(),
    };

    const result = await createServiceJob(
      validCreationForm({ title: "No", description: "Too short", category: "UNKNOWN" }),
      staff,
      repository,
    );

    expect(result.errors).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        description: expect.any(String),
        category: expect.any(String),
      }),
    );
    expect(repository.createWithCreatedActivity).not.toHaveBeenCalled();
  });

  it("derives requester, OPEN state, SLA, and CREATED activity on the server", async () => {
    const repository: JobCreationRepository = {
      createWithCreatedActivity: vi.fn(),
    };
    const formData = validCreationForm();
    formData.set("requesterId", manager.id);
    formData.set("assigneeId", technician.id);

    const result = await createServiceJob(formData, staff, repository, {
      now,
      createId: vi.fn().mockReturnValueOnce("job-new").mockReturnValueOnce("activity-new"),
      createReference: () => "SVC-NEW-0001",
    });

    expect(result.reference).toBe("SVC-NEW-0001");
    expect(repository.createWithCreatedActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "job-new",
        reference: "SVC-NEW-0001",
        requesterId: staff.id,
        assigneeId: null,
        status: "OPEN",
        slaDueAt: new Date("2026-09-09T11:00:00.000Z"),
        activity: expect.objectContaining({
          id: "activity-new",
          authorId: staff.id,
          type: "CREATED",
        }),
      }),
    );
  });

  it("rejects a technician before it writes anything", async () => {
    const repository: JobCreationRepository = {
      createWithCreatedActivity: vi.fn(),
    };

    const result = await createServiceJob(validCreationForm(), technician, repository);

    expect(result.message).toMatch(/do not have permission/i);
    expect(repository.createWithCreatedActivity).not.toHaveBeenCalled();
  });
});

function assignmentRepository(
  overrides: Partial<AssignmentRepository> = {},
): AssignmentRepository {
  return {
    findJob: vi.fn().mockResolvedValue({
      id: "job-vpn-access",
      status: "OPEN",
      assignee: null,
    }),
    findTechnician: vi.fn().mockResolvedValue(technician),
    assignWithActivity: vi.fn(),
    ...overrides,
  };
}

describe("assignServiceJob", () => {
  it("rejects non-manager assignment attempts", async () => {
    const repository = assignmentRepository();
    const formData = new FormData();
    formData.set("assigneeId", technician.id);

    const result = await assignServiceJob("SVC-1048", formData, staff, repository);

    expect(result.message).toMatch(/do not have permission/i);
    expect(repository.findJob).not.toHaveBeenCalled();
    expect(repository.assignWithActivity).not.toHaveBeenCalled();
  });

  it("rejects an assignee outside the seeded technician set", async () => {
    const repository = assignmentRepository({ findTechnician: vi.fn().mockResolvedValue(null) });
    const formData = new FormData();
    formData.set("assigneeId", manager.id);

    const result = await assignServiceJob("SVC-1048", formData, manager, repository);

    expect(result.errors.assigneeId).toMatch(/not available/i);
    expect(repository.assignWithActivity).not.toHaveBeenCalled();
  });

  it("records an ASSIGNED activity only when the assignee changes", async () => {
    const repository = assignmentRepository();
    const formData = new FormData();
    formData.set("assigneeId", technician.id);

    const result = await assignServiceJob("SVC-1048", formData, manager, repository, {
      now,
      createId: () => "activity-assigned",
    });

    expect(result.message).toMatch(/now assigned/i);
    expect(repository.assignWithActivity).toHaveBeenCalledWith({
      jobId: "job-vpn-access",
      assigneeId: technician.id,
      fromValue: null,
      toValue: technician.name,
      authorId: manager.id,
      activityId: "activity-assigned",
      createdAt: now,
    });
  });

  it("keeps closed jobs immutable", async () => {
    const repository = assignmentRepository({
      findJob: vi.fn().mockResolvedValue({
        id: "job-closed",
        status: "CLOSED",
        assignee: { id: technician.id, name: technician.name },
      }),
    });
    const formData = new FormData();
    formData.set("assigneeId", technician.id);

    const result = await assignServiceJob("SVC-1043", formData, manager, repository);

    expect(result.message).toMatch(/closed service jobs/i);
    expect(repository.assignWithActivity).not.toHaveBeenCalled();
  });
});

function statusForm(status: string) {
  const formData = new FormData();
  formData.set("status", status);
  return formData;
}

function statusRepository(
  job: Parameters<StatusTransitionRepository["findJob"]>[0] extends string
    ? Awaited<ReturnType<StatusTransitionRepository["findJob"]>>
    : never,
): StatusTransitionRepository {
  return {
    findJob: vi.fn().mockResolvedValue(job),
    updateStatusWithActivity: vi.fn(),
  };
}

describe("transitionServiceJobStatus", () => {
  it("allows an assigned technician to move OPEN to IN_PROGRESS", async () => {
    const repository = statusRepository({
      id: "job-vpn-access",
      status: "OPEN",
      assigneeId: technician.id,
      resolvedAt: null,
    });

    const result = await transitionServiceJobStatus(
      "SVC-1048",
      statusForm("IN_PROGRESS"),
      technician,
      repository,
      { now, createId: () => "activity-progress" },
    );

    expect(result.changed).toBe(true);
    expect(repository.updateStatusWithActivity).toHaveBeenCalledWith({
      jobId: "job-vpn-access",
      status: "IN_PROGRESS",
      resolvedAt: null,
      closedAt: null,
      fromValue: "OPEN",
      toValue: "IN_PROGRESS",
      authorId: technician.id,
      activityId: "activity-progress",
      createdAt: now,
    });
  });

  it("sets resolvedAt when an assigned technician resolves work", async () => {
    const repository = statusRepository({
      id: "job-vpn-access",
      status: "IN_PROGRESS",
      assigneeId: technician.id,
      resolvedAt: null,
    });

    await transitionServiceJobStatus(
      "SVC-1048",
      statusForm("RESOLVED"),
      technician,
      repository,
      { now, createId: () => "activity-resolved" },
    );

    expect(repository.updateStatusWithActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "RESOLVED",
        resolvedAt: now,
        closedAt: null,
        fromValue: "IN_PROGRESS",
        toValue: "RESOLVED",
      }),
    );
  });

  it("allows a manager to close resolved work and retains resolvedAt", async () => {
    const resolvedAt = new Date("2026-09-09T01:00:00.000Z");
    const repository = statusRepository({
      id: "job-vpn-access",
      status: "RESOLVED",
      assigneeId: technician.id,
      resolvedAt,
    });

    await transitionServiceJobStatus(
      "SVC-1048",
      statusForm("CLOSED"),
      manager,
      repository,
      { now, createId: () => "activity-closed" },
    );

    expect(repository.updateStatusWithActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "CLOSED",
        resolvedAt,
        closedAt: now,
        authorId: manager.id,
      }),
    );
  });

  it("allows a manager to return resolved work to IN_PROGRESS and clears resolvedAt", async () => {
    const repository = statusRepository({
      id: "job-vpn-access",
      status: "RESOLVED",
      assigneeId: technician.id,
      resolvedAt: new Date("2026-09-09T01:00:00.000Z"),
    });

    await transitionServiceJobStatus(
      "SVC-1048",
      statusForm("IN_PROGRESS"),
      manager,
      repository,
      { now, createId: () => "activity-returned" },
    );

    expect(repository.updateStatusWithActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "IN_PROGRESS",
        resolvedAt: null,
        closedAt: null,
      }),
    );
  });

  it.each([
    [staff, "OPEN", technician.id, "IN_PROGRESS"],
    [technician, "OPEN", manager.id, "IN_PROGRESS"],
    [technician, "OPEN", technician.id, "RESOLVED"],
    [technician, "IN_PROGRESS", technician.id, "CLOSED"],
    [manager, "OPEN", technician.id, "CLOSED"],
    [manager, "RESOLVED", technician.id, "OPEN"],
    [manager, "RESOLVED", technician.id, "ARCHIVED"],
  ])("rejects forged or unauthorized transition requests", async (actor, status, assigneeId, target) => {
    const repository = statusRepository({
      id: "job-vpn-access",
      status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED",
      assigneeId,
      resolvedAt: null,
    });

    const result = await transitionServiceJobStatus(
      "SVC-1048",
      statusForm(target),
      actor,
      repository,
    );

    expect(result.errors.status).toMatch(/invalid/i);
    expect(repository.updateStatusWithActivity).not.toHaveBeenCalled();
  });

  it("rejects any status mutation after a job is closed", async () => {
    const repository = statusRepository({
      id: "job-closed",
      status: "CLOSED",
      assigneeId: technician.id,
      resolvedAt: now,
    });

    const result = await transitionServiceJobStatus(
      "SVC-1043",
      statusForm("IN_PROGRESS"),
      manager,
      repository,
    );

    expect(result.message).toMatch(/closed service jobs/i);
    expect(repository.updateStatusWithActivity).not.toHaveBeenCalled();
  });
});

function noteRepository(
  job: Awaited<ReturnType<InternalNoteRepository["findJob"]>>,
): InternalNoteRepository {
  return {
    findJob: vi.fn().mockResolvedValue(job),
    addInternalNote: vi.fn(),
  };
}

function noteForm(note: string) {
  const formData = new FormData();
  formData.set("note", note);
  return formData;
}

describe("addInternalWorkNote", () => {
  it("trims the note and derives its author from the active technician", async () => {
    const repository = noteRepository({
      id: "job-vpn-access",
      status: "IN_PROGRESS",
      assigneeId: technician.id,
    });
    const formData = noteForm("  Reinstalled the device certificate and retested the connection.  ");
    formData.set("authorId", manager.id);

    const result = await addInternalWorkNote("SVC-1048", formData, technician, repository, {
      now,
      createId: () => "activity-note",
    });

    expect(result.changed).toBe(true);
    expect(repository.addInternalNote).toHaveBeenCalledWith({
      jobId: "job-vpn-access",
      authorId: technician.id,
      note: "Reinstalled the device certificate and retested the connection.",
      activityId: "activity-note",
      createdAt: now,
    });
  });

  it("rejects blank and oversized notes before looking up a job", async () => {
    const repository = noteRepository({
      id: "job-vpn-access",
      status: "IN_PROGRESS",
      assigneeId: technician.id,
    });

    const blank = await addInternalWorkNote("SVC-1048", noteForm("  "), technician, repository);
    const oversized = await addInternalWorkNote(
      "SVC-1048",
      noteForm("x".repeat(1_001)),
      technician,
      repository,
    );

    expect(blank.errors.note).toMatch(/at least 3/i);
    expect(oversized.errors.note).toMatch(/1,000/i);
    expect(repository.findJob).not.toHaveBeenCalled();
  });

  it.each([
    [staff, "IN_PROGRESS", technician.id],
    [technician, "IN_PROGRESS", manager.id],
    [manager, "CLOSED", technician.id],
  ])("rejects unauthorized or closed-job note attempts", async (actor, status, assigneeId) => {
    const repository = noteRepository({
      id: "job-vpn-access",
      status: status as "IN_PROGRESS" | "CLOSED",
      assigneeId,
    });

    const result = await addInternalWorkNote(
      "SVC-1048",
      noteForm("Checked the service request."),
      actor,
      repository,
    );

    expect(result.message).toMatch(/do not have permission/i);
    expect(repository.addInternalNote).not.toHaveBeenCalled();
  });
});
