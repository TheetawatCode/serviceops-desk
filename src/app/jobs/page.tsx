import type { Metadata } from "next";

import { JobsView } from "@/components/jobs-view";
import { getActiveDemoIdentity } from "@/lib/demo-identity.server";
import { getJobsForIdentity } from "@/lib/jobs";

export const metadata: Metadata = { title: "Service jobs" };
export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const identity = await getActiveDemoIdentity();
  const jobs = await getJobsForIdentity(identity);
  return <JobsView jobs={jobs} />;
}
