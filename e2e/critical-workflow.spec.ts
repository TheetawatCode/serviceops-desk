import { expect, test } from "@playwright/test";

import { E2E_JOB_TITLE_PREFIX } from "./support/database";
import { demoIdentityIds, startAs, switchIdentity } from "./support/identity";

test("completes the Staff to Manager to Technician service workflow", async ({ page }) => {
  const jobTitle = `${E2E_JOB_TITLE_PREFIX} Restore access for onboarding laptop`;
  const workNote = "Verified the access policy and refreshed the device profile.";

  await startAs(page, demoIdentityIds.staff);
  await page.goto("/jobs/new");
  await page.getByLabel("Title").fill(jobTitle);
  await page
    .getByLabel("Description")
    .fill("The onboarding laptop cannot reach the internal workspace after its initial setup.");
  await page.getByLabel("Category").selectOption("ACCESS");
  await page.getByLabel("Priority").selectOption("HIGH");
  await page.getByRole("button", { name: "Create service job" }).click();

  await expect(page).toHaveURL(/\/jobs\/SVC-[A-Z0-9-]+\?created=1$/);
  await expect(page.getByRole("heading", { level: 1, name: jobTitle })).toBeVisible();
  const jobPath = new URL(page.url()).pathname;

  await switchIdentity(page, demoIdentityIds.manager);
  await expect(page.getByRole("heading", { name: "Assignment" })).toBeVisible();
  await page.getByLabel("Technician").selectOption(demoIdentityIds.technician);
  await page.getByRole("button", { name: "Save assignment" }).click();
  await expect(page.getByText("Narin Srisuk is now assigned to this job.")).toBeVisible();

  await switchIdentity(page, demoIdentityIds.technician);
  await page.goto("/jobs/new");
  await expect(page.getByRole("heading", { name: "Service job not found" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New service job" })).toHaveCount(0);

  await page.goto(jobPath);
  await page.getByRole("button", { name: "Start work" }).click();
  await expect(page.getByText("Job status updated to in progress.")).toBeVisible();
  await expect(page.getByText("In Progress", { exact: true }).first()).toBeVisible();

  await page.getByRole("textbox", { name: "Work note" }).fill(workNote);
  await page.getByRole("button", { name: "Add internal note" }).click();
  await expect(page.getByText("Internal note added.")).toBeVisible();
  await expect(page.getByText(workNote)).toBeVisible();

  await page.getByRole("button", { name: "Mark resolved" }).click();
  await expect(page.getByText("Resolved", { exact: true }).first()).toBeVisible();

  await switchIdentity(page, demoIdentityIds.manager);
  await page.getByRole("button", { name: "Close job" }).click();
  await expect(page.getByText("Closed", { exact: true }).first()).toBeVisible();
});
