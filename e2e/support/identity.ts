import { expect, type Page } from "@playwright/test";

export const demoIdentityIds = {
  manager: "demo-manager-ananda",
  technician: "demo-technician-narin",
  staff: "demo-staff-mina",
} as const;

const identityAnnouncements: Record<string, string> = {
  [demoIdentityIds.manager]: "Active demo identity: Ananda Rattanakul, Manager",
  [demoIdentityIds.technician]: "Active demo identity: Narin Srisuk, Technician",
  [demoIdentityIds.staff]: "Active demo identity: Mina Chantarat, Staff",
};

export async function startAs(page: Page, identityId: string) {
  const response = await page.request.post("/api/demo-identity", {
    data: { identityId },
  });
  expect(response.ok()).toBe(true);
}

export async function switchIdentity(page: Page, identityId: string) {
  const switcher = page.getByLabel("Choose demo identity");
  await switcher.selectOption(identityId);
  await expect(switcher).toHaveValue(identityId);
  await expect(page.getByText(identityAnnouncements[identityId], { exact: true })).toBeAttached();
}
