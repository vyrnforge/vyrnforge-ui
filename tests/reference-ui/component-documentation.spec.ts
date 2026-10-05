import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const evidenceDirectory = path.resolve("test-results/reference-ui-evidence");

type FrameworkId = "native-html" | "react" | "angular" | "vue";

async function openComponent(
  page: Page,
  componentId: string,
  framework: FrameworkId = "react",
) {
  await page.goto(`/?framework=${framework}#/components/${componentId}`);
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
  const body = await page.screenshot({
    path: path.join(evidenceDirectory, filename),
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
  await testInfo.attach(filename, { body, contentType: "image/png" });
}

test.describe("component documentation completeness", () => {
  test("representative component classes keep live UI ahead of generated API", async ({
    page,
  }, testInfo) => {
    const componentIds = [
      "text-input",
      "select",
      "tabs",
      "dialog",
      "error-state",
      "panel",
    ] as const;

    for (const componentId of componentIds) {
      await openComponent(page, componentId);

      const specimen = page.locator("#component-specimen");
      const accessibility = page.locator("#component-accessibility-styling");
      const frameworkUsage = page.locator("#component-framework-usage");
      const generatedApi = page.locator("#component-generated-api");

      await expect(specimen).toBeVisible();
      await expect(specimen.locator(".vf-docs-component-specimen")).toBeVisible();
      await expect(accessibility).toBeVisible();
      await expect(frameworkUsage).toBeVisible();
      await expect(generatedApi).toBeVisible();

      const positions = await Promise.all(
        [specimen, accessibility, frameworkUsage, generatedApi].map((locator) =>
          locator.evaluate((element) => element.offsetTop),
        ),
      );
      expect(positions).toEqual(
        [...positions].sort((left, right) => left - right),
      );

      await expectNoPageOverflow(page);
      await capture(page, testInfo, `reference-component-${componentId}`);
    }
  });

  test("Button documentation stays available in every first-class framework context", async ({
    page,
  }) => {
    const frameworks: FrameworkId[] = [
      "native-html",
      "react",
      "angular",
      "vue",
    ];

    for (const framework of frameworks) {
      await openComponent(page, "button", framework);
      await expect(page.locator("#component-specimen")).toBeVisible();
      await expect(page.locator("#component-framework-usage")).toBeVisible();
      await expect(page.locator("#component-generated-api")).toBeVisible();
      await expectNoPageOverflow(page);
    }
  });

  test("mobile and dark component detail remain usable", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openComponent(page, "text-input");

    const themeToggle = page.getByRole("button", { name: "Toggle dark theme" });
    await themeToggle.click();
    await expect(page.locator(".vf-docs-app")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await expect(page.locator("#component-specimen")).toBeVisible();
    await expect(page.locator("#component-framework-usage")).toBeVisible();
    await expect(page.locator("#component-generated-api")).toBeVisible();
    await expectNoPageOverflow(page);
    await capture(page, testInfo, "reference-component-text-input-mobile-dark");
  });
});
