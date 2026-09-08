"use server";

import { revalidatePath } from "next/cache";

import { getActiveDemoIdentity } from "@/lib/demo-identity.server";
import {
  assignServiceJob,
  type JobMutationState,
} from "@/lib/job-mutations";
import { assignmentRepository } from "@/lib/job-mutations.server";

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
