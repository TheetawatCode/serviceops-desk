import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard-view";
import { getDashboardForIdentity } from "@/lib/dashboard";
import { getActiveDemoIdentity } from "@/lib/demo-identity.server";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await getActiveDemoIdentity();
  const data = await getDashboardForIdentity(identity);

  return <DashboardView data={data} identity={identity} />;
}
