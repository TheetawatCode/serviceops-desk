import type { PersonSummary } from "@/lib/job-types";

export const seededDemoIdentities = [
  {
    id: "demo-manager-ananda",
    name: "Ananda Rattanakul",
    email: "ananda.manager@serviceops.demo",
    role: "MANAGER",
  },
  {
    id: "demo-technician-narin",
    name: "Narin Srisuk",
    email: "narin.tech@serviceops.demo",
    role: "TECHNICIAN",
  },
  {
    id: "demo-staff-mina",
    name: "Mina Chantarat",
    email: "mina.staff@serviceops.demo",
    role: "STAFF",
  },
] as const satisfies readonly PersonSummary[];

export const DEFAULT_DEMO_IDENTITY_ID = seededDemoIdentities[0].id;

export type SeededDemoIdentityId = (typeof seededDemoIdentities)[number]["id"];

export function getSeededDemoIdentity(
  value: unknown,
): (typeof seededDemoIdentities)[number] | null {
  if (typeof value !== "string") return null;
  return seededDemoIdentities.find((identity) => identity.id === value) ?? null;
}
