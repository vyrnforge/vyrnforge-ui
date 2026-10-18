import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  expectWithinViewport,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2005 Popover and Tooltip browser contract", () => {
  test("keeps popover content in the viewport and restores trigger focus", async ({
    page,
  }) => {
    await openFixture(page, browserFixtureIds.popoverPosition);
    const trigger = fixtureAction(page, "open-popover");
    await trigger.click();

    const content = fixtureRegion(page, "popover-content");
    const floating = page.locator(".vf-popover__content");
    await expect(content).toBeVisible();
    await expectWithinViewport(page, floating);

    await fixtureAction(page, "popover-action").focus();
    await page.keyboard.press("Escape");
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("dismisses popover content from an outside pointer action", async ({
    page,
  }) => {
    await openFixture(page, browserFixtureIds.popoverPosition);
    await fixtureAction(page, "open-popover").click();
    await expect(fixtureRegion(page, "popover-content")).toBeVisible();

    await fixtureAction(page, "outside-popover").click();
    await expect(fixtureRegion(page, "popover-content")).toHaveCount(0);
  });

  test("shows tooltip from focus, links aria-describedby, and closes on Escape", async ({
    page,
  }) => {
    await openFixture(page, browserFixtureIds.tooltipFocusHover);
    const trigger = fixtureAction(page, "tooltip-trigger");
    await trigger.focus();

    const tooltip = page.getByRole("tooltip", {
      name: "Refresh the fixed case data",
    });
    await expect(tooltip).toBeVisible();
    await expectWithinViewport(page, tooltip);
    await expect(trigger).toHaveAttribute("aria-describedby", /.+/);

    await page.keyboard.press("Escape");
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute("aria-describedby", /.+/);
  });

  test("shows and hides tooltip from hover", async ({ page }) => {
    await openFixture(page, browserFixtureIds.tooltipFocusHover);
    const trigger = fixtureAction(page, "tooltip-trigger");
    const tooltip = page.getByRole("tooltip");

    await trigger.hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
  });
});
