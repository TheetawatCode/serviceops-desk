import { notFound } from "next/navigation";

import { JobCreateForm } from "@/components/job-create-form";
import { getActiveDemoIdentity } from "@/lib/demo-identity.server";

export const metadata = { title: "New service job" };
export const dynamic = "force-dynamic";

export default async function NewServiceJobPage() {
  const identity = await getActiveDemoIdentity();
  if (identity.role === "TECHNICIAN") notFound();

  return (
    <div className="page-stack form-page">
      <header className="page-header form-page-header">
        <div>
          <p className="eyebrow">New request</p>
          <h1>New service job</h1>
          <p>Open a clear, actionable request for the service operations queue.</p>
        </div>
      </header>
      <JobCreateForm />
    </div>
  );
}
