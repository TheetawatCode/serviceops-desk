import { expect, test } from "@playwright/test";

import { demoIdentityIds, startAs } from "./support/identity";

test.beforeEach(async ({ page }) => {
  await startAs(page, demoIdentityIds.manager);
});

test("main routes expose a clear heading and semantic status labels", async ({ page }) => {
  const routes = [
    ["/dashboard", "Good morning, Ananda"],
    ["/jobs", "Service jobs"],
    ["/jobs/new", "New service job"],
    ["/jobs/SVC-1048", "Restore VPN access for finance laptop"],
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
  }

  await expect(page.getByText("In Progress", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Breached|At Risk|On Track|Complete/, { exact: true }).first()).toBeVisible();
});

test("creation errors remain associated with visible labels", async ({ page }) => {
  await page.goto("/jobs/new");
  await page.getByRole("button", { name: "Create service job" }).click();

  await expect(page.getByText("Review the highlighted fields and try again.")).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Use at least 5 characters so the request is easy to scan."),
  ).toBeVisible();
  await expect(page.getByLabel("Description")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Category")).toHaveAttribute("aria-invalid", "true");
});

test("mobile navigation traps and restores focus without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jobs");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to main content")).toBeFocused();
  const focusOutline = await page.getByText("Skip to main content").evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focusOutline.style).not.toBe("none");
  expect(Number.parseFloat(focusOutline.width)).toBeGreaterThanOrEqual(2);

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await page.keyboard.press("Tab");
  await expect(menuButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation" }).last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeHidden();
  await expect(menuButton).toBeFocused();
});
