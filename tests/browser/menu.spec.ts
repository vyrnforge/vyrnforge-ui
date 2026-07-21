import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2004 Menu browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.menuKeyboard);
  });

  test("supports arrow, Home, End, disabled-item skipping, and selection", async ({
    page,
  }) => {
    const trigger = fixtureAction(page, "open-menu");
    await trigger.click();

    const edit = page.getByRole("menuitem", { name: "Edit case" });
    const archive = page.getByRole("menuitem", { name: "Archive case" });
    const duplicate = page.getByRole("menuitem", { name: "Duplicate case" });
    const remove = page.getByRole("menuitem", { name: "Delete case" });

    await expect(edit).toBeFocused();
    await expect(duplicate).toBeDisabled();

    await page.keyboard.press("ArrowDown");
    await expect(archive).toBeFocused();
    await page.keyboard.press("End");
    await expect(remove).toBeFocused();
    await page.keyboard.press("Home");
    await expect(edit).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(remove).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(fixtureRegion(page, "selection")).toHaveText(
      "Delete case selected",
    );
  });

  test("closes with Escape and restores focus", async ({ page }) => {
    const trigger = fixtureAction(page, "open-menu");
    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
