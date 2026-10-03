import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const evidenceDirectory = path.resolve("test-results/reference-ui-evidence");

async function openReference(page: Page, route: string, framework = "react") {
  await page.goto(`/?framework=${framework}#/${route}`);
  await expect(page.locator(".vf-reference-shell")).toBeVisible();
  await expect(page.locator("#vf-reference-main")).toBeVisible();
}

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    root:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));
  expect(overflow.body).toBeLessThanOrEqual(1);
  expect(overflow.root).toBeLessThanOrEqual(1);
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await mkdir(evidenceDirectory, { recursive: true });
  const filename = `${name}.png`;
  const screenshotPath = path.join(evidenceDirectory, filename);
  const body = await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
  await testInfo.attach(filename, { body, contentType: "image/png" });
}

test.describe("VyrnForge Reference product", () => {
  test("representative templates render through one shell", async ({
    page,
  }, testInfo) => {
    const routes = [
      ["overview", "reading"],
      ["getting-started", "reading"],
      ["component-reference", "catalog"],
      ["package-reference", "catalog"],
      ["token-reference", "catalog"],
      ["pattern-reference", "catalog"],
      ["executable-examples", "example"],
      ["data-grid", "wide"],
    ] as const;

    for (const [route, layout] of routes) {
      await openReference(page, route);
      await expect(page.locator(".vf-reference-shell")).toHaveAttribute(
        "data-layout-mode",
        layout,
      );
      await expect(
        page.locator("header .vf-reference-shell__identity"),
      ).toContainText("VyrnForge");
      await expect(
        page.locator("header .vf-reference-shell__identity"),
      ).toContainText("Reference");
      await expectNoPageOverflow(page);
      await capture(page, testInfo, `reference-${route}`);
    }
  });

  test("theme, route focus, and search states are accessible", async ({
    page,
  }, testInfo) => {
    await openReference(page, "overview");

    const themeToggle = page.getByRole("button", { name: "Toggle dark theme" });
    await expect(themeToggle).toHaveAttribute("aria-pressed", "false");
    await themeToggle.click();
    await expect(themeToggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".vf-docs-app")).toHaveAttribute(
      "data-theme",
      "dark",
    );

    await page
      .getByRole("button", { name: "Components", exact: true })
      .first()
      .click();
    await expect(page.locator("#vf-reference-main")).toBeFocused();

    const search = page.getByRole("searchbox", {
      name: "Search VyrnForge Reference",
    });
    await search.fill("definitely-no-reference-result");
    await expect(page.getByRole("status")).toContainText(
      "No Reference results",
    );

    await capture(page, testInfo, "reference-dark-search-zero");
  });

  test("unavailable and invalid routes use unified state presentation", async ({
    page,
  }, testInfo) => {
    await openReference(page, "data-grid", "angular");
    await expect(
      page.getByText("Unavailable in this context", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".vf-docs-state")).toBeVisible();
    await capture(page, testInfo, "reference-unavailable-grid-angular");

    await openReference(page, "not-a-real-reference-route");
    await expect(
      page.getByText("Page not found", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".vf-docs-state")).toBeVisible();
    await capture(page, testInfo, "reference-invalid-route");
  });

  test("mobile navigation remains usable without desktop sidebar", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openReference(page, "overview");
    await expect(page.locator(".vf-reference-shell__sidebar")).toBeHidden();

    const browse = page.getByRole("button", { name: "Browse" });
    await expect(browse).toBeVisible();
    await browse.click();
    await expect(browse).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("dialog", { name: "VyrnForge Reference" }),
    ).toBeVisible();

    await expectNoPageOverflow(page);
    await capture(page, testInfo, "reference-mobile-navigation");
  });
});
