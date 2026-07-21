import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2003 Drawer browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.drawerFocus);
  });

  test("contains focus, closes with Escape, and restores the opener", async ({
    page,
  }) => {
    const opener = fixtureAction(page, "open-drawer");
    await opener.click();

    const drawer = page.getByRole("dialog", { name: "Case filters" });
    const owner = page.getByRole("textbox", { name: "Filter owner" });
    await expect(drawer).toBeVisible();
    await expect(owner).toBeFocused();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("button", { name: "Close drawer" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(owner).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(fixtureRegion(page, "overlay-state")).toHaveText(
      "Drawer closed",
    );
  });

  test("dismisses from the drawer overlay", async ({ page }) => {
    await fixtureAction(page, "open-drawer").click();
    await expect(
      page.getByRole("dialog", { name: "Case filters" }),
    ).toBeVisible();

    await page
      .locator(".vf-drawer__overlay")
      .click({ position: { x: 4, y: 4 } });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
