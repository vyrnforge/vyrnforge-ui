import { expect, test } from "@playwright/test";

const pagesBaseURL = "http://127.0.0.1:4175/vyrnforge-ui/";

test.describe("Icon Reference catalog", () => {
  test("lists the canonical icon catalog and supports search and selection", async ({
    page,
  }) => {
    await page.goto("/?framework=react#/icons");
    await expect(
      page.getByRole("heading", { name: "Icons", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("33 icons", { exact: true })).toBeVisible();
    await expect(
      page.locator('.vf-docs-icon-grid [role="listitem"]'),
    ).toHaveCount(33);

    await page.getByRole("searchbox", { name: "Search icons" }).fill("eye");
    await expect(
      page.locator('.vf-docs-icon-grid [role="listitem"]'),
    ).toHaveCount(2);
    await expect(
      page.getByText("2 of 33 icons", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "EyeOff" }).click();
    await expect(
      page.getByRole("heading", { name: "EyeOff", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".vf-docs-icon-code")).toContainText(
      '<Icon name="EyeOff" />',
    );
  });

  test("shows shared sizes and active-framework usage without a local framework chooser", async ({
    page,
  }) => {
    await page.goto("/?framework=vue#/icons");
    await expect(page.locator(".vf-docs-icon-size")).toHaveCount(4);
    await expect(page.locator(".vf-docs-icon-sizes")).toContainText("12px");
    await expect(page.locator(".vf-docs-icon-sizes")).toContainText("20px");
    await expect(page.locator(".vf-docs-icon-code")).toContainText(
      '<VfIcon name="Search" />',
    );
    await expect(
      page.getByRole("heading", { name: "Vue usage" }),
    ).toBeVisible();
    await expect(page.locator("#component-framework-usage")).toHaveCount(0);
  });

  test("renders native usage in Native HTML context", async ({ page }) => {
    await page.goto("/?framework=native-html#/icons");
    await expect(page.locator(".vf-docs-icon-code")).toContainText(
      '<vf-icon name="Search"></vf-icon>',
    );
    await expect(
      page.getByRole("heading", { name: "Native HTML usage" }),
    ).toBeVisible();
  });

  test("navigates through the real Pages base path and keeps the framework selector active", async ({
    page,
  }) => {
    await page.goto(`${pagesBaseURL}?framework=react#/overview`);

    const sidebar = page.locator(".vf-reference-shell__sidebar");
    const iconsLink = sidebar.getByRole("link", { name: "Icons", exact: true });
    await expect(iconsLink).toHaveAttribute("href", "?framework=react#/icons");
    await iconsLink.click();

    await expect(page).toHaveURL(/\/vyrnforge-ui\/\?framework=react#\/icons$/u);
    await expect(
      page.getByRole("heading", { name: "Icon catalog", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("33 icons", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Search icons" }),
    ).toBeVisible();
    await expect(page.locator(".vf-docs-icon-grid")).toBeVisible();
    await expect(page.locator(".vf-docs-icon-size")).toHaveCount(4);
    await expect(
      page.getByRole("heading", { name: "React usage", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Accessibility", exact: true }),
    ).toBeVisible();

    await page.getByRole("combobox", { name: "Framework" }).selectOption("vue");
    await expect(page).toHaveURL(/\/vyrnforge-ui\/\?framework=vue#\/icons$/u);
    await expect(
      page.getByRole("heading", { name: "Vue usage", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".vf-docs-icon-code")).toContainText(
      '<VfIcon name="Search" />',
    );
  });
});
