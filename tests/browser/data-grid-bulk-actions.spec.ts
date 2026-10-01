import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("data-grid bulk action bar", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.dataGridSelection);
  });

  test("preserves visible, hidden, disabled, invoked, and clear-selection behavior", async ({
    page,
  }) => {
    const bulkStatus = page.getByRole("status");
    await expect(bulkStatus).toContainText("1 row selected");

    const flagSelected = page.getByRole("button", { name: "Flag selected" });
    const disabledAction = page.getByRole("button", {
      name: "Disabled selection action",
    });

    await expect(flagSelected).toBeEnabled();
    await expect(disabledAction).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Hidden selection action" }),
    ).toHaveCount(0);

    await flagSelected.click();
    await expect(fixtureRegion(page, "grid-bulk-action-result")).toHaveText(
      "Bulk action: Flagged: case-100",
    );

    await page.getByRole("button", { name: "Clear selected rows" }).click();
    await expect(fixtureRegion(page, "grid-selection-state")).toHaveText(
      "Selected rows: none",
    );
    await expect(page.locator(".udg-bulk-action-bar")).toHaveCount(0);
  });
});
