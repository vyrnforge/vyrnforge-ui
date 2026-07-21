import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2002 Dialog browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.dialogFocus);
  });

  test("traps focus and restores it to the opener after Escape", async ({
    page,
  }) => {
    const opener = fixtureAction(page, "open-dialog");
    await opener.focus();
    await opener.click();

    const dialog = page.getByRole("dialog", { name: "Confirm case update" });
    const confirm = fixtureAction(page, "confirm-dialog");
    await expect(dialog).toBeVisible();
    await expect(confirm).toBeFocused();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Close dialog" }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(confirm).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(fixtureRegion(page, "overlay-state")).toHaveText(
      "Dialog closed",
    );
  });

  test("dismisses from the overlay and restores focus", async ({ page }) => {
    const opener = fixtureAction(page, "open-dialog");
    await opener.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page
      .locator(".vf-dialog__overlay")
      .click({ position: { x: 4, y: 4 } });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});
