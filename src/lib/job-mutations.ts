import type { JobStatus, PersonSummary, Priority } from "@/lib/job-types";

export type JobCreationFields = {
  title: string;
  description: string;
  category: string;
  priority: string;
};

export type JobFormErrors = Partial<
  Record<keyof JobCreationFields | "assigneeId" | "status" | "note", string>
>;

export type JobMutationState = {
  message: string | null;
  errors: JobFormErrors;
  changed?: boolean;
};

export const initialJobMutationState: JobMutationState = {
  message: null,
  errors: {},
};

const categories = ["HARDWARE", "SOFTWARE", "ACCESS", "FACILITIES", "OTHER"] as const;
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const slaHoursByPriority: Record<Priority, number> = {
  LOW: 72,
  MEDIUM: 24,
  HIGH: 8,
  URGENT: 4,
};

export function readJobCreationFields(formData: FormData): JobCreationFields {
  const read = (name: keyof JobCreationFields) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  return {
    title: read("title"),
    description: read("description"),
    category: read("category"),
    priority: read("priority"),
  };
}

export function validateJobCreation(fields: JobCreationFields): JobFormErrors {
  const errors: JobFormErrors = {};

  if (fields.title.length < 5) {
    errors.title = "Use at least 5 characters so the request is easy to scan.";
  } else if (fields.title.length > 120) {
    errors.title = "Keep the title to 120 characters or fewer.";
  }

  if (fields.description.length < 20) {
    errors.description = "Add at least 20 characters so the service team has enough context.";
  } else if (fields.description.length > 1_500) {
    errors.description = "Keep the description to 1,500 characters or fewer.";
  }

  if (!categories.includes(fields.category as (typeof categories)[number])) {
    errors.category = "Choose a service category.";
  }

  if (!priorities.includes(fields.priority as (typeof priorities)[number])) {
    errors.priority = "Choose a priority.";
  }

  return errors;
}

export function deriveSlaDueAt(priority: Priority, now = new Date()) {
  return new Date(now.getTime() + slaHoursByPriority[priority] * 60 * 60 * 1000);
}

export type JobCreationPayload = {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: (typeof categories)[number];
  priority: Priority;
  status: "OPEN";
  requesterId: string;
  assigneeId: null;
  slaDueAt: Date;
  createdAt: Date;
  activity: {
    id: string;
    authorId: string;
    type: "CREATED";
    note: string;
    createdAt: Date;
  };
};

export type JobCreationRepository = {
  createWithCreatedActivity: (payload: JobCreationPayload) => Promise<void>;
};

type IdFactory = () => string;

export async function createServiceJob(
  formData: FormData,
  actor: PersonSummary,
  repository: JobCreationRepository,
  options: {
    now?: Date;
    createId?: IdFactory;
    createReference?: IdFactory;
  } = {},
): Promise<JobMutationState & { reference?: string }> {
  if (actor.role === "TECHNICIAN") {
    return { message: "You do not have permission to create service jobs.", errors: {} };
  }

  const fields = readJobCreationFields(formData);
  const errors = validateJobCreation(fields);
  if (Object.keys(errors).length) {
    return { message: "Review the highlighted fields and try again.", errors };
  }

  const now = options.now ?? new Date();
  const createId = options.createId ?? crypto.randomUUID;
  const createReference = options.createReference ?? (() => `SVC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
  const priority = fields.priority as Priority;
  const reference = createReference();

  await repository.createWithCreatedActivity({
    id: createId(),
    reference,
    title: fields.title,
    description: fields.description,
    category: fields.category as (typeof categories)[number],
    priority,
    status: "OPEN",
    requesterId: actor.id,
    assigneeId: null,
    slaDueAt: deriveSlaDueAt(priority, now),
    createdAt: now,
    activity: {
      id: createId(),
      authorId: actor.id,
      type: "CREATED",
      note: "Service job created.",
      createdAt: now,
    },
  });

  return { message: "Service job created.", errors: {}, reference };
}

export type AssignableTechnician = Pick<PersonSummary, "id" | "name" | "role">;

export type AssignmentJob = {
  id: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignee: Pick<PersonSummary, "id" | "name"> | null;
};

export type WorkflowJob = {
  id: string;
  status: JobStatus;
  assigneeId: string | null;
  resolvedAt?: Date | null;
};

export type StatusAction = {
  target: JobStatus;
  label: string;
};

export function getAvailableStatusActions(
  job: WorkflowJob,
  actor: PersonSummary,
): StatusAction[] {
  if (job.status === "CLOSED") return [];

  if (actor.role === "TECHNICIAN" && job.assigneeId === actor.id) {
    if (job.status === "OPEN") return [{ target: "IN_PROGRESS", label: "Start work" }];
    if (job.status === "IN_PROGRESS") return [{ target: "RESOLVED", label: "Mark resolved" }];
  }

  if (actor.role === "MANAGER" && job.status === "RESOLVED") {
    return [
      { target: "CLOSED", label: "Close job" },
      { target: "IN_PROGRESS", label: "Return to in progress" },
    ];
  }

  return [];
}

export function canAddInternalNote(job: WorkflowJob, actor: PersonSummary) {
  if (job.status === "CLOSED" || actor.role === "STAFF") return false;
  return actor.role === "MANAGER" || job.assigneeId === actor.id;
}

export type AssignmentRepository = {
  findJob: (reference: string) => Promise<AssignmentJob | null>;
  findTechnician: (id: string) => Promise<AssignableTechnician | null>;
  assignWithActivity: (input: {
    jobId: string;
    assigneeId: string;
    fromValue: string | null;
    toValue: string;
    authorId: string;
    activityId: string;
    createdAt: Date;
  }) => Promise<void>;
};

export async function assignServiceJob(
  reference: string,
  formData: FormData,
  actor: PersonSummary,
  repository: AssignmentRepository,
  options: { now?: Date; createId?: IdFactory } = {},
): Promise<JobMutationState> {
  if (actor.role !== "MANAGER") {
    return { message: "You do not have permission to assign service jobs.", errors: {} };
  }

  const assigneeId = formData.get("assigneeId");
  if (typeof assigneeId !== "string" || !assigneeId) {
    return { message: "Choose a technician before assigning this job.", errors: { assigneeId: "Choose a technician." } };
  }

  const job = await repository.findJob(reference);
  if (!job) return { message: "This service job is no longer available.", errors: {} };
  if (job.status === "CLOSED") {
    return { message: "Closed service jobs cannot be reassigned.", errors: {} };
  }

  const technician = await repository.findTechnician(assigneeId);
  if (!technician || technician.role !== "TECHNICIAN") {
    return {
      message: "Choose one of the seeded technician identities.",
      errors: { assigneeId: "That technician is not available for assignment." },
    };
  }

  if (job.assignee?.id === technician.id) {
    return { message: `${technician.name} is already assigned to this job.`, errors: {} };
  }

  const now = options.now ?? new Date();
  const createId = options.createId ?? crypto.randomUUID;
  await repository.assignWithActivity({
    jobId: job.id,
    assigneeId: technician.id,
    fromValue: job.assignee?.name ?? null,
    toValue: technician.name,
    authorId: actor.id,
    activityId: createId(),
    createdAt: now,
  });

  return {
    message: `${technician.name} is now assigned to this job.`,
    errors: {},
    changed: true,
  };
}

export type StatusTransitionRepository = {
  findJob: (reference: string) => Promise<WorkflowJob | null>;
  updateStatusWithActivity: (input: {
    jobId: string;
    status: JobStatus;
    resolvedAt: Date | null;
    closedAt: Date | null;
    fromValue: JobStatus;
    toValue: JobStatus;
    authorId: string;
    activityId: string;
    createdAt: Date;
  }) => Promise<void>;
};

export async function transitionServiceJobStatus(
  reference: string,
  formData: FormData,
  actor: PersonSummary,
  repository: StatusTransitionRepository,
  options: { now?: Date; createId?: IdFactory } = {},
): Promise<JobMutationState> {
  const target = formData.get("status");
  if (typeof target !== "string") {
    return { message: "Choose a valid status action.", errors: { status: "Invalid status action." } };
  }

  const job = await repository.findJob(reference);
  if (!job) return { message: "This service job is no longer available.", errors: {} };
  if (job.status === "CLOSED") {
    return { message: "Closed service jobs cannot be changed.", errors: {} };
  }

  const action = getAvailableStatusActions(job, actor).find((item) => item.target === target);
  if (!action) {
    return { message: "That status change is not allowed for this job.", errors: { status: "Invalid status action." } };
  }

  const now = options.now ?? new Date();
  const createId = options.createId ?? crypto.randomUUID;
  const nextStatus = action.target;
  await repository.updateStatusWithActivity({
    jobId: job.id,
    status: nextStatus,
    resolvedAt:
      nextStatus === "RESOLVED"
        ? now
        : nextStatus === "IN_PROGRESS"
          ? null
          : job.resolvedAt ?? null,
    closedAt: nextStatus === "CLOSED" ? now : null,
    fromValue: job.status,
    toValue: nextStatus,
    authorId: actor.id,
    activityId: createId(),
    createdAt: now,
  });

  return { message: `Job status updated to ${nextStatus.toLowerCase().replace("_", " ")}.`, errors: {}, changed: true };
}

export const INTERNAL_NOTE_MAX_LENGTH = 1_000;

export function validateInternalNote(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return { error: "Enter an internal note." };
  const note = value.trim();
  if (note.length < 3) return { error: "Write at least 3 characters for an internal note." };
  if (note.length > INTERNAL_NOTE_MAX_LENGTH) {
    return { error: `Keep the note to ${INTERNAL_NOTE_MAX_LENGTH.toLocaleString()} characters or fewer.` };
  }
  return { note };
}

export type InternalNoteRepository = {
  findJob: (reference: string) => Promise<WorkflowJob | null>;
  addInternalNote: (input: {
    jobId: string;
    authorId: string;
    note: string;
    activityId: string;
    createdAt: Date;
  }) => Promise<void>;
};

export async function addInternalWorkNote(
  reference: string,
  formData: FormData,
  actor: PersonSummary,
  repository: InternalNoteRepository,
  options: { now?: Date; createId?: IdFactory } = {},
): Promise<JobMutationState> {
  const validation = validateInternalNote(formData.get("note"));
  if ("error" in validation) {
    return { message: "Review the internal note and try again.", errors: { note: validation.error } };
  }

  const job = await repository.findJob(reference);
  if (!job) return { message: "This service job is no longer available.", errors: {} };
  if (!canAddInternalNote(job, actor)) {
    return { message: "You do not have permission to add a note to this job.", errors: {} };
  }

  const now = options.now ?? new Date();
  const createId = options.createId ?? crypto.randomUUID;
  await repository.addInternalNote({
    jobId: job.id,
    authorId: actor.id,
    note: validation.note,
    activityId: createId(),
    createdAt: now,
  });

  return { message: "Internal note added.", errors: {}, changed: true };
}
