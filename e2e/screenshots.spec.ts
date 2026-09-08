import { expect, test } from "@playwright/test";
import path from "node:path";

import { cleanE2EJobs } from "./support/database";
import { demoIdentityIds, startAs } from "./support/identity";

const screenshotDirectory = path.join(process.cwd(), "docs", "screenshots");

test.beforeAll(async () => {
  await cleanE2EJobs();
});

test.beforeEach(async ({ page }) => {
  await startAs(page, demoIdentityIds.manager);
});

test("captures curated desktop application views", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1, name: "Good morning, Ananda" })).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDirectory, "dashboard-desktop.png"),
    fullPage: true,
    animations: "disabled",
  });

  await page.goto("/jobs");
  await expect(page.getByRole("heading", { level: 1, name: "Service jobs" })).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDirectory, "jobs-desktop.png"),
    fullPage: true,
    animations: "disabled",
  });

  await page.goto("/jobs/SVC-1048");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Restore VPN access");
  await page.screenshot({
    path: path.join(screenshotDirectory, "job-detail-desktop.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("captures the mobile job list with visible keyboard focus and no overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jobs");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to main content")).toBeFocused();
  await page.screenshot({
    path: path.join(screenshotDirectory, "jobs-mobile.png"),
    fullPage: true,
    animations: "disabled",
  });
});
