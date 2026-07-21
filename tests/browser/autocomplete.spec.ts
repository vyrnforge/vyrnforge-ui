import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2006 Autocomplete browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.autocompleteControlled);
  });

  test("filters, skips disabled options, selects, and clears from the keyboard", async ({
    page,
  }) => {
    const input = page.getByRole("combobox", { name: "Workspace role" });
    await input.focus();
    await input.fill("");
    await page.keyboard.press("ArrowDown");

    const listbox = page.getByRole("listbox");
    const admin = page.getByRole("option", { name: /Administrator/ });
    const operator = page.getByRole("option", { name: /Operator/ });
    const viewer = page.getByRole("option", { name: /Viewer/ });
    await expect(listbox).toBeVisible();
    await expect(operator).toHaveAttribute("aria-disabled", "true");
    const adminId = await admin.getAttribute("id");
    expect(adminId).toBeTruthy();
    await expect(input).toHaveAttribute("aria-activedescendant", adminId!);

    await page.keyboard.press("ArrowDown");
    const viewerId = await viewer.getAttribute("id");
    expect(viewerId).toBeTruthy();
    await expect(input).toHaveAttribute("aria-activedescendant", viewerId!);
    await page.keyboard.press("Enter");

    await expect(input).toHaveValue("Viewer");
    await expect(fixtureRegion(page, "autocomplete-value")).toHaveText(
      "Selected role: viewer",
    );
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect(input).toHaveValue("");
    await expect(fixtureRegion(page, "autocomplete-value")).toHaveText(
      "Selected role: none",
    );
  });

  test("filters by typing and restores the selected label after Escape", async ({
    page,
  }) => {
    const input = page.getByRole("combobox", { name: "Workspace role" });
    await input.fill("admin");
    await expect(
      page.getByRole("option", { name: /Administrator/ }),
    ).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Administrator");

    await input.fill("view");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(input).toHaveValue("Administrator");
  });

  test("keeps the disabled variant non-interactive", async ({ page }) => {
    const disabled = page.getByRole("combobox", {
      name: "Disabled workspace role",
    });
    await expect(disabled).toBeDisabled();
  });
});
