import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobDetailView } from "@/components/job-detail-view";
import { getActiveDemoIdentity } from "@/lib/demo-identity.server";
import { getJobForIdentity } from "@/lib/jobs";

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
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const identity = await getActiveDemoIdentity();
  const job = await getJobForIdentity(reference, identity);

  if (!job) notFound();

  return <JobDetailView job={job} />;
}
