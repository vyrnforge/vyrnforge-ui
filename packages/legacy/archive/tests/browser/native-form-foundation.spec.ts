import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("EL-6004 native form-associated foundation", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.nativeFormFoundation);
  });

  test("submits, updates, disables, and resets through ElementInternals", async ({
    page,
  }) => {
    const element = page.locator("vf-native-form-probe");
    await expect(element).toHaveAttribute("data-value", "initial");

    await fixtureAction(page, "native-submit").click();
    await expect(fixtureRegion(page, "native-form-submission")).toHaveText(
      "account=initial",
    );

    await fixtureAction(page, "native-set-value").click();
    await expect(element).toHaveAttribute("data-value", "updated");
    await expect(fixtureRegion(page, "native-form-event")).toHaveText(
      "Value event: updated",
    );
    await fixtureAction(page, "native-submit").click();
    await expect(fixtureRegion(page, "native-form-submission")).toHaveText(
      "account=updated",
    );

    await fixtureAction(page, "native-toggle-disabled").click();
    await expect(element).toHaveAttribute("data-disabled", "true");
    await fixtureAction(page, "native-submit").click();
    await expect(fixtureRegion(page, "native-form-submission")).toHaveText(
      "No form value",
    );

    await fixtureAction(page, "native-toggle-disabled").click();
    await fixtureAction(page, "native-reset").click();
    await expect(element).toHaveAttribute("data-value", "initial");
    await expect(fixtureRegion(page, "native-form-event")).toHaveText(
      "Reset event: form-reset",
    );
  });

  test("reports required validity with a canonical typed event", async ({
    page,
  }) => {
    const element = page.locator("vf-native-form-probe");
    await fixtureAction(page, "native-clear-value").click();
    await expect(element).toHaveAttribute("data-value", "");

    const valid = await element.evaluate((node) =>
      (node as HTMLElement & { reportValidity(): boolean }).reportValidity(),
    );
    expect(valid).toBe(false);
    await expect(fixtureRegion(page, "native-form-event")).toHaveText(
      "Invalid event: A fixture value is required.",
    );
  });
});
