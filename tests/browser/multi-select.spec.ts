import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2007 MultiSelect browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.multiSelectKeyboard);
  });

  test("uses roving option focus, skips disabled options, and keeps selection open", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "Workspace permissions" });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");

    const owner = page.getByRole("option", { name: /Owner/ });
    const approver = page.getByRole("option", { name: /Approver/ });
    const billing = page.getByRole("option", { name: /Billing/ });
    const viewer = page.getByRole("option", { name: /Viewer/ });
    await expect(owner).toBeFocused();
    await expect(owner).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowDown");
    await expect(approver).toBeFocused();
    await page.keyboard.press("Space");
    await expect(approver).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await expect(viewer).toBeFocused();
    await expect(billing).toBeDisabled();
    await expect(fixtureRegion(page, "multi-select-value")).toHaveText(
      "Selected permissions: owner, approver",
    );

    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("filters options and clears all selected values", async ({ page }) => {
    await page.getByRole("button", { name: "Workspace permissions" }).click();
    const search = page.getByRole("searchbox", { name: "Search options" });
    await search.fill("view");
    await expect(page.getByRole("option", { name: /Viewer/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /Owner/ })).toHaveCount(0);

    await page.getByRole("option", { name: /Viewer/ }).click();
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect(fixtureRegion(page, "multi-select-value")).toHaveText(
      "Selected permissions: none",
    );
  });
});
