import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  addInternalWorkNoteAction,
  assignServiceJobAction,
  transitionServiceJobStatusAction,
} from "@/app/jobs/[reference]/actions";
import { JobDetailView } from "@/components/job-detail-view";
import {
  getActiveDemoIdentity,
  getSeededTechnicians,
} from "@/lib/demo-identity.server";
import { getJobForIdentity } from "@/lib/jobs";
import { canAddInternalNote, getAvailableStatusActions } from "@/lib/job-mutations";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  const identity = await getActiveDemoIdentity();
  const job = await getJobForIdentity(reference, identity);
  return { title: job ? `${job.reference} · ${job.title}` : "Job not found" };
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { reference } = await params;
  const { created } = await searchParams;
  const identity = await getActiveDemoIdentity();
  const job = await getJobForIdentity(reference, identity);

  if (!job) notFound();

  const canAssign = identity.role === "MANAGER" && job.status !== "CLOSED";
  const workflowJob = {
    id: job.id,
    status: job.status,
    assigneeId: job.assignee?.id ?? null,
    resolvedAt: job.resolvedAt ? new Date(job.resolvedAt) : null,
  };
  const statusActions = getAvailableStatusActions(workflowJob, identity);
  const canAddNote = canAddInternalNote(workflowJob, identity);
  const technicians = canAssign ? await getSeededTechnicians() : [];
  const assignmentAction = canAssign
    ? assignServiceJobAction.bind(null, reference)
    : undefined;
  const statusAction = statusActions.length
    ? transitionServiceJobStatusAction.bind(null, reference)
    : undefined;
  const internalNoteAction = canAddNote
    ? addInternalWorkNoteAction.bind(null, reference)
    : undefined;

  return (
    <JobDetailView
      job={job}
      assignmentAction={assignmentAction}
      statusActions={statusActions}
      statusAction={statusAction}
      internalNoteAction={internalNoteAction}
      technicians={technicians}
      showCreatedFeedback={created === "1"}
    />
  );
}
