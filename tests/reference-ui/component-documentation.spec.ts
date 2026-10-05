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

async function expectSectionOrder(page: Page) {
  const specimen = page.locator("#component-specimen");
  const accessibility = page.locator("#component-accessibility");
  const frameworkUsage = page.locator("#component-framework-usage");
  const generatedApi = page.locator("#component-generated-api");

  await expect(specimen).toBeVisible();
  await expect(accessibility).toBeVisible();
  await expect(frameworkUsage).toBeVisible();
  await expect(generatedApi).toBeVisible();

  const positions = await Promise.all(
    [specimen, accessibility, frameworkUsage, generatedApi].map((locator) =>
      locator.evaluate((element) => element.offsetTop),
    ),
  );
  expect(positions).toEqual([...positions].sort((left, right) => left - right));
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
  test("representative details precede API", async ({ page }, testInfo) => {
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
      await expect(
        page.locator("#component-specimen .vf-docs-component-specimen"),
      ).toBeVisible();
      await expect(page.locator("#component-interaction")).toContainText(
        "Keyboard documentation",
      );
      await expect(page.locator("#component-accessibility")).toContainText(
        "Canonical evidence status",
      );
      await expectSectionOrder(page);
      await expectNoPageOverflow(page);
      await capture(page, testInfo, `reference-component-${componentId}`);
    }
  });

  test("capability sections follow the canonical information hierarchy", async ({
    page,
  }) => {
    await openComponent(page, "button");

    const orderedIds = [
      "component-specimen",
      "component-usage",
      "component-capabilities",
      "component-composition",
      "component-interaction",
      "component-accessibility",
      "component-framework-usage",
      "component-theming",
      "component-related-maturity",
      "component-generated-api",
    ];
    const visible = [];
    for (const id of orderedIds) {
      const locator = page.locator(`#${id}`);
      if ((await locator.count()) > 0) {
        visible.push(locator);
      }
    }

    const positions = await Promise.all(
      visible.map((locator) =>
        locator.evaluate((element) => element.offsetTop),
      ),
    );
    expect(positions).toEqual(
      [...positions].sort((left, right) => left - right),
    );
    await expect(page.locator("#component-capabilities")).toContainText(
      "variant",
    );
    await expect(page.locator("#component-interaction")).toContainText(
      "Keyboard documentation",
    );
    await expectNoPageOverflow(page);
  });

  test("layout and composition records render real VyrnForge specimens", async ({
    page,
  }) => {
    const componentIds = ["card", "stack", "inline", "section"] as const;

    for (const componentId of componentIds) {
      await openComponent(page, componentId);
      const specimen = page.locator(
        "#component-specimen .vf-docs-component-specimen__stage",
      );
      await expect(specimen).toBeVisible();
      await expect(specimen).not.toContainText(
        "does not yet have a standalone specimen",
      );
      await expect(specimen).not.toContainText(
        "best understood inside a real application composition",
      );
      await expect(page.locator("#component-composition")).toBeVisible();
      await expectNoPageOverflow(page);
    }
  });

  test("Button is documented for every framework", async ({ page }) => {
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

  test("catalog and sidebar share the selected framework component set", async ({
    page,
  }) => {
    await page.goto("/?framework=angular#/component-reference");
    await expect(page.locator(".vf-docs-catalog")).toBeVisible();
    await expect(page.locator(".vf-docs-catalog__intro")).toContainText(
      "angular",
    );

    const componentRoute = (href: string | null) =>
      href?.slice(href.indexOf("#/components/")) ?? null;
    const catalogHrefs = await page
      .locator('.vf-docs-component-index a[href*="#/components/"]')
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute("href")),
      );
    const sidebarHrefs = await page
      .locator(
        '.vf-reference-navigation__sections a[href*="#/components/"]',
      )
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute("href")),
      );

    expect(new Set(catalogHrefs.map(componentRoute))).toEqual(
      new Set(sidebarHrefs.map(componentRoute)),
    );
    expect(catalogHrefs.length).toBeGreaterThan(0);
    await expectNoPageOverflow(page);
  });

  test("sidebar exposes active component records", async ({ page }) => {
    await openComponent(page, "button", "react");

    const navigation = page.locator(".vf-reference-navigation__sections");
    const buttonSelector = 'a[href*="#/components/button"]';
    const textInputSelector = 'a[href*="#/components/text-input"]';
    const buttonLink = navigation.locator(buttonSelector).first();
    const textInputLink = navigation.locator(textInputSelector).first();

    await expect(buttonLink).toBeVisible();
    await expect(buttonLink).toHaveClass(/vf-side-nav__item--active/u);
    await expect(textInputLink).toBeVisible();

    const search = page.getByRole("searchbox", {
      name: "Search VyrnForge Reference",
    });
    await search.fill("TextInput");
    await expect(textInputLink).toBeVisible();
    await expect(navigation).toContainText("TextInput");
    await expectNoPageOverflow(page);
  });

  test("Tabs specimen supports keyboard focus", async ({ page }) => {
    await openComponent(page, "tabs");

    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(3);
    await tabs.first().focus();
    await expect(tabs.first()).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
  });

  test("Dialog specimen closes with Escape", async ({ page }) => {
    await openComponent(page, "dialog");

    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Review deployment" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("mobile dark detail stays contained", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openComponent(page, "text-input");

    const themeToggle = page.getByRole("button", { name: "Toggle dark theme" });
    await themeToggle.click();
    await expect(page.locator(".vf-docs-app")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await expect(page.locator("#component-specimen")).toBeVisible();
    await expect(
      page.locator("#component-framework-usage pre").first(),
    ).toBeVisible();
    await expect(page.locator("#component-generated-api")).toBeVisible();

    const apiScroller = page.locator(".vf-docs-api-table-scroll").first();
    if ((await apiScroller.count()) > 0) {
      const widths = await apiScroller.evaluate((element) => ({
        client: element.clientWidth,
        scroll: element.scrollWidth,
      }));
      expect(widths.scroll).toBeGreaterThanOrEqual(widths.client);
    }

    await expectNoPageOverflow(page);
    await capture(page, testInfo, "reference-component-text-input-mobile-dark");
  });

  test("tablet detail supports reduced motion", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 768, height: 1024 });
    await openComponent(page, "tabs");

    expect(
      await page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);
    await expect(page.locator(".vf-docs-reference-outline")).toBeVisible();
    await expectSectionOrder(page);
    await expectNoPageOverflow(page);
    await capture(
      page,
      testInfo,
      "reference-component-tabs-tablet-reduced-motion",
    );
  });
});
