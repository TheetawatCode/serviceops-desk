"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getActiveDemoIdentity } from "@/lib/demo-identity.server";
import {
  createServiceJob,
  type JobMutationState,
} from "@/lib/job-mutations";
import { jobCreationRepository } from "@/lib/job-mutations.server";

export async function createServiceJobAction(
  _previousState: JobMutationState,
  formData: FormData,
): Promise<JobMutationState> {
  const identity = await getActiveDemoIdentity();
  const result = await createServiceJob(formData, identity, jobCreationRepository);

  if (!result.reference) return result;

  revalidatePath("/jobs");
  redirect(`/jobs/${result.reference}?created=1`);
}
