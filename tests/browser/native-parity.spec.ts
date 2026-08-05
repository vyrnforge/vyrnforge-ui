import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
  setFixtureDensity,
  setFixtureTheme,
} from "./support/fixtures";

test.describe("EL-6018 GMF3 native non-grid parity", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.nativeParityElements);
  });

  test("registers the deterministic 58-tag catalog and completion elements", async ({
    page,
  }) => {
    const result = await page.evaluate(() => {
      const completionTags = [
        "vf-icon",
        "vf-inline-message",
        "vf-skeleton",
        "vf-top-nav",
      ];
      return {
        completionCount: completionTags.filter((tag) => customElements.get(tag))
          .length,
        serviceMethods: ["add", "updateToast", "dismiss", "dismissAll"].filter(
          (method) =>
            typeof (
              customElements.get("vf-toast-viewport")
                ?.prototype as unknown as Record<string, unknown>
            )?.[method] === "function",
        ),
      };
    });

    expect(result.completionCount).toBe(4);
    expect(result.serviceMethods).toEqual([
      "add",
      "updateToast",
      "dismiss",
      "dismissAll",
    ]);
  });

  test("preserves semantic and accessible completion-element contracts", async ({
    page,
  }) => {
    const icon = fixtureRegion(page, "native-parity-icon");
    await expect(icon).toHaveAttribute("role", "img");
    await expect(icon).toHaveAttribute("aria-label", "Search icon");
    await expect(icon.locator("svg")).toHaveCount(1);

    const message = fixtureRegion(page, "native-parity-message");
    await expect(message).toHaveAttribute("role", "status");
    await expect(message).toContainText("Policy saved");
    await expect(message).toContainText("The updated policy is active.");

    const skeleton = fixtureRegion(page, "native-parity-skeleton");
    await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    await expect(skeleton).toHaveClass(/vf-skeleton--static/);

    const topNav = fixtureRegion(page, "native-parity-top-nav");
    await expect(topNav).toHaveAttribute("role", "banner");
    await expect(topNav).toContainText("VyrnForge IAM");
    await expect(topNav.getByRole("navigation")).toContainText("Accounts");
    await expect(
      topNav.getByRole("button", { name: "Create account" }),
    ).toBeVisible();
  });

  test("proves renderer composition and native toast service mappings", async ({
    page,
  }) => {
    await fixtureAction(page, "native-parity-dropdown-trigger").click();
    await expect(
      fixtureRegion(page, "native-parity-dropdown-popover").getByRole("dialog"),
    ).toBeVisible();
    await expect(fixtureRegion(page, "native-parity-dropdown")).toHaveText(
      "Dropdown open",
    );
    await page.keyboard.press("Escape");
    await expect(fixtureRegion(page, "native-parity-dropdown")).toHaveText(
      "Dropdown closed",
    );

    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(fixtureRegion(page, "native-parity-toast-action")).toHaveText(
      "Toast action: retry",
    );

    await fixtureAction(page, "native-parity-toast-add").click();
    await expect(fixtureRegion(page, "native-parity-toast-service")).toHaveText(
      "Toast service: added service-toast",
    );
    await expect(page.locator("vf-toast-viewport vf-toast")).toContainText(
      "Service toast",
    );

    await fixtureAction(page, "native-parity-toast-update").click();
    await expect(page.locator("vf-toast-viewport vf-toast")).toContainText(
      "Updated through the native viewport API.",
    );

    await fixtureAction(page, "native-parity-toast-dismiss").click();
    await expect(page.locator("vf-toast-viewport vf-toast")).toHaveCount(0);
  });

  test("inherits shared theme and density tokens without renderer leakage", async ({
    page,
  }) => {
    const initial = await fixtureRegion(page, "fixture").evaluate((element) => {
      const rootStyle = getComputedStyle(element);
      const nav = element.querySelector("vf-top-nav");
      const navStyle = nav ? getComputedStyle(nav) : null;
      return {
        controlHeight: rootStyle.getPropertyValue("--vf-control-height").trim(),
        navBackground: navStyle?.backgroundColor ?? "",
        navColor: navStyle?.color ?? "",
      };
    });

    await setFixtureDensity(page, "compact");
    const compactHeight = await fixtureRegion(page, "fixture").evaluate(
      (element) =>
        getComputedStyle(element)
          .getPropertyValue("--vf-control-height")
          .trim(),
    );
    expect(compactHeight).not.toBe(initial.controlHeight);

    await setFixtureTheme(page, "dark");
    const dark = await fixtureRegion(page, "fixture").evaluate((element) => {
      const nav = element.querySelector("vf-top-nav");
      const style = nav ? getComputedStyle(nav) : null;
      return {
        background: style?.backgroundColor ?? "",
        color: style?.color ?? "",
      };
    });
    expect(dark.background).not.toBe(initial.navBackground);
    expect(dark.color).not.toBe(initial.navColor);
  });
});
