import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureRegion,
  gridCell,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2012 data-grid keyboard contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.dataGridKeyboard);
  });

  test("uses one roving cell tab stop and navigates row and grid boundaries", async ({
    page,
  }) => {
    const firstCell = gridCell(page, "case-100", "id");
    await firstCell.focus();
    await expect(firstCell).toBeFocused();
    await expect(firstCell).toHaveAttribute("tabindex", "0");

    await page.keyboard.press("ArrowRight");
    await expect(gridCell(page, "case-100", "owner")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(gridCell(page, "case-200", "owner")).toBeFocused();

    await page.keyboard.press("End");
    await expect(gridCell(page, "case-200", "status")).toBeFocused();

    await page.keyboard.press("Control+Home");
    await expect(firstCell).toBeFocused();

    await page.keyboard.press("Control+End");
    await expect(gridCell(page, "case-300", "status")).toBeFocused();
  });

  test("activates rows with Enter and toggles only selectable rows with Space", async ({
    page,
  }) => {
    const reviewCell = gridCell(page, "case-200", "id");
    await reviewCell.focus();
    await page.keyboard.press("Enter");

    await expect(fixtureRegion(page, "grid-activated-row")).toHaveText(
      "Activated row: case-200",
    );
    await expect(fixtureRegion(page, "grid-selected-rows")).toHaveText(
      "Selected rows: case-100, case-200",
    );

    await page.keyboard.press("Space");
    await expect(fixtureRegion(page, "grid-selected-rows")).toHaveText(
      "Selected rows: case-100",
    );

    const disabledCell = gridCell(page, "case-300", "id");
    await disabledCell.focus();
    await page.keyboard.press("Space");
    await expect(fixtureRegion(page, "grid-selected-rows")).toHaveText(
      "Selected rows: case-100",
    );
  });

  test("supports keyboard sorting, resizing, and column reorder fallback", async ({
    page,
  }) => {
    const grid = page.getByRole("grid", {
      name: "Keyboard fixture cases data",
    });
    const caseHeader = grid.locator('th[data-udg-column-id="id"]');
    await grid.getByRole("button", { name: "Case", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(caseHeader).toHaveAttribute("aria-sort", "ascending");

    const ownerSeparator = grid.getByRole("separator", {
      name: "Resize Owner column",
    });
    await ownerSeparator.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await expect(ownerSeparator).toHaveAttribute("aria-valuenow", "252");

    const ownerGrip = grid.getByRole("button", {
      name: "Reorder Owner column",
    });
    await ownerGrip.focus();
    await page.keyboard.press("Alt+Shift+ArrowLeft");

    await expect
      .poll(() => grid.locator(".udg-header-label").allTextContents())
      .toEqual(["Owner", "Case", "Status"]);
    await expect(
      page.locator('[data-udg-region="interaction-status"]'),
    ).toHaveText("Owner column moved left.");
    await expect(ownerGrip).toBeFocused();
  });
});
