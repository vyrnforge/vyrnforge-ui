import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2011 Toast browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.toastLifecycle);
  });

  test("announces polite success feedback and dismisses it after its duration", async ({
    page,
  }) => {
    await fixtureAction(page, "show-success-toast").click();
    const toast = page.locator("#save-success");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("aria-live", "polite");
    await expect(toast).toHaveCount(0, { timeout: 3000 });
  });

  test("keeps duration-null warning feedback persistent until manual dismissal", async ({
    page,
  }) => {
    await fixtureAction(page, "show-warning-toast").click();
    const toast = page.locator("#sync-warning");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("aria-live", "assertive");
    await page.waitForTimeout(1200);
    await expect(toast).toBeVisible();

    await toast.getByRole("button", { name: "Dismiss notification" }).click();
    await expect(toast).toHaveCount(0);
  });

  test("pauses timeout on hover and resumes after pointer exit", async ({
    page,
  }) => {
    await fixtureAction(page, "show-pausable-toast").click();
    const toast = page.locator("#export-progress");
    await toast.hover();
    await page.waitForTimeout(950);
    await expect(toast).toBeVisible();

    await fixtureAction(page, "dismiss-all-toasts").hover();
    await expect(toast).toHaveCount(0, { timeout: 2000 });
  });

  test("pauses timeout while focus remains inside the toast", async ({
    page,
  }) => {
    await fixtureAction(page, "show-pausable-toast").click();
    const toast = page.locator("#export-progress");
    const dismiss = toast.getByRole("button", { name: "Dismiss notification" });
    await dismiss.focus();
    await page.waitForTimeout(950);
    await expect(toast).toBeVisible();

    await fixtureAction(page, "dismiss-all-toasts").focus();
    await expect(toast).toHaveCount(0, { timeout: 2000 });
  });
});
