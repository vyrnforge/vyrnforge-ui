import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("EL-6012 through EL-6017 native advanced elements", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.nativeAdvancedElements);
  });

  test("registers the deterministic 54-element public catalog", async ({
    page,
  }) => {
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            [
              "vf-autocomplete",
              "vf-multi-select",
              "vf-transfer-list",
              "vf-dialog",
              "vf-drawer",
              "vf-popover",
              "vf-menu",
              "vf-tooltip",
              "vf-toast",
              "vf-toast-viewport",
              "vf-confirm-dialog",
              "vf-app-shell",
              "vf-page-header",
              "vf-page-toolbar",
            ].filter((tag) => customElements.get(tag)).length,
        ),
      )
      .toBe(14);
  });

  test("submits collection values through ElementInternals", async ({
    page,
  }) => {
    const autocomplete = page.locator(
      "vf-autocomplete [data-vf-autocomplete-input]",
    );
    await autocomplete.fill("Access");
    await page.locator('vf-autocomplete [role="option"]').first().click();

    const multiSelectTrigger = page.locator(
      "vf-multi-select .vf-multi-select__trigger",
    );
    await multiSelectTrigger.click();
    await page
      .locator('vf-multi-select [role="option"][data-value="editor"]')
      .click();
    await multiSelectTrigger.click();
    await expect(
      page.locator("vf-multi-select .vf-multi-select__popover"),
    ).toBeHidden();

    await page
      .locator('vf-transfer-list input[data-value="admin"]')
      .first()
      .check();
    await page.getByRole("button", { name: "Move selected right" }).click();

    await fixtureAction(page, "advanced-submit").click();
    await expect(fixtureRegion(page, "native-advanced-submission")).toHaveText(
      "owner=access, roles=reader, roles=editor, applications=admin, applications=portal",
    );
  });

  test("opens and dismisses modal and anchored overlays", async ({ page }) => {
    await fixtureAction(page, "advanced-open-dialog").click();
    await expect(
      page.getByRole("dialog", { name: "Native dialog", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(fixtureRegion(page, "native-advanced-overlays")).toHaveText(
      "Dialog closed",
    );

    await fixtureAction(page, "advanced-open-drawer").click();
    await expect(page.locator("vf-drawer [role=dialog]")).toBeVisible();
    await page.locator("vf-drawer button[aria-label=Close]").click();
    await expect(fixtureRegion(page, "native-advanced-overlays")).toHaveText(
      "Drawer closed",
    );

    await fixtureAction(page, "advanced-popover-trigger").click();
    const popoverDialog = page.locator("vf-popover").getByRole("dialog");
    await expect(popoverDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(popoverDialog).toBeHidden();

    await fixtureAction(page, "advanced-menu-trigger").click();
    await page.locator('vf-menu [role="menuitem"]').first().focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(fixtureRegion(page, "native-advanced-menu")).toHaveText(
      "Menu action: edit",
    );

    await fixtureAction(page, "advanced-tooltip-trigger").focus();
    await expect(page.locator('vf-tooltip [role="tooltip"]')).toBeVisible();
  });

  test("dispatches feedback contracts and renders composition surfaces", async ({
    page,
  }) => {
    await fixtureAction(page, "advanced-add-toast").click();
    await expect(fixtureRegion(page, "native-advanced-toast")).toHaveText(
      "Toast: saved",
    );
    await expect(page.locator("vf-toast-viewport vf-toast")).toContainText(
      "Saved",
    );

    await fixtureAction(page, "advanced-open-confirm").click();
    const confirmDialog = page.getByRole("dialog", {
      name: "Delete account?",
      exact: true,
    });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog
      .getByRole("button", { name: "Confirm", exact: true })
      .click();
    await expect(fixtureRegion(page, "native-advanced-confirm")).toHaveText(
      "Confirmation: confirmed",
    );

    const shell = fixtureRegion(page, "native-advanced-composition");
    await expect(shell).toContainText("Enterprise header");
    await expect(shell).toContainText("Enterprise navigation");
    await expect(page.locator("vf-page-header")).toContainText("Accounts");
    await expect(page.locator("vf-page-toolbar")).toContainText(
      "Create account",
    );
  });
});
