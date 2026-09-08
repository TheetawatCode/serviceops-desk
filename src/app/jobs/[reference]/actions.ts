"use server";

import { revalidatePath } from "next/cache";

import { getActiveDemoIdentity } from "@/lib/demo-identity.server";
import {
  addInternalWorkNote,
  assignServiceJob,
  transitionServiceJobStatus,
  type JobMutationState,
} from "@/lib/job-mutations";
import {
  assignmentRepository,
  internalNoteRepository,
  statusTransitionRepository,
} from "@/lib/job-mutations.server";

export async function assignServiceJobAction(
  reference: string,
  _previousState: JobMutationState,
  formData: FormData,
): Promise<JobMutationState> {
  const identity = await getActiveDemoIdentity();
  const result = await assignServiceJob(reference, formData, identity, assignmentRepository);

  if (result.changed) {
    revalidatePath(`/jobs/${reference}`);
    revalidatePath("/jobs");
  }

  return result;
}

export async function transitionServiceJobStatusAction(
  reference: string,
  _previousState: JobMutationState,
  formData: FormData,
): Promise<JobMutationState> {
  const identity = await getActiveDemoIdentity();
  const result = await transitionServiceJobStatus(
    reference,
    formData,
    identity,
    statusTransitionRepository,
  );

  if (result.changed) {
    revalidatePath(`/jobs/${reference}`);
    revalidatePath("/jobs");
  }

  return result;
}

export async function addInternalWorkNoteAction(
  reference: string,
  _previousState: JobMutationState,
  formData: FormData,
): Promise<JobMutationState> {
  const identity = await getActiveDemoIdentity();
  const result = await addInternalWorkNote(reference, formData, identity, internalNoteRepository);

  if (result.changed) {
    revalidatePath(`/jobs/${reference}`);
  }

  return result;
}
