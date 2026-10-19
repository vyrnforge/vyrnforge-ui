import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2010 Tabs and Toggle Button browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.tabsToggleKeyboard);
  });

  test("automatically activates tabs and skips disabled tabs", async ({
    page,
  }) => {
    const summary = page.getByRole("tab", { name: "Summary" });
    const billing = page.getByRole("tab", { name: "Billing" });
    const activity = page.getByRole("tab", { name: "Activity" });
    await summary.focus();
    await page.keyboard.press("ArrowRight");

    await expect(activity).toBeFocused();
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await expect(billing).toBeDisabled();
    await expect(fixtureRegion(page, "tabs-value")).toHaveText(
      "Active tab: activity",
    );

    await page.keyboard.press("Home");
    await expect(summary).toBeFocused();
    await page.keyboard.press("End");
    await expect(activity).toBeFocused();
  });

  test("toggles controlled and uncontrolled pressed states from the keyboard", async ({
    page,
  }) => {
    const controlled = fixtureAction(page, "controlled-toggle");
    await controlled.focus();
    await page.keyboard.press("Space");
    await expect(controlled).toHaveAttribute("aria-pressed", "true");
    await expect(fixtureRegion(page, "controlled-toggle-value")).toHaveText(
      "Filters pinned",
    );

    const uncontrolled = fixtureAction(page, "uncontrolled-toggle");
    await expect(uncontrolled).toHaveAttribute("aria-pressed", "true");
    await uncontrolled.press("Enter");
    await expect(uncontrolled).toHaveAttribute("aria-pressed", "false");
  });
});
