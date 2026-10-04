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
  const overflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          className: element.className,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          tagName: element.tagName,
          width: Math.round(bounds.width),
        };
      })
      .filter((entry) => entry.right > viewportWidth + 1 || entry.left < -1)
      .slice(0, 12);

    return {
      body: document.body.scrollWidth - document.body.clientWidth,
      offenders,
      root:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      viewportWidth,
    };
  });
  const message = JSON.stringify(overflow.offenders, null, 2);
  expect(overflow.body, message).toBeLessThanOrEqual(1);
  expect(overflow.root, message).toBeLessThanOrEqual(1);
}

async function expectReferenceHero(page: Page) {
  const hero = page.locator(".vf-reference-page__hero");
  await expect(hero).toBeVisible();
  const bounds = await hero.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { height: Math.round(rect.height), width: Math.round(rect.width) };
  });
  expect(bounds.width).toBeGreaterThan(700);
  expect(bounds.height).toBeGreaterThan(180);
}

async function expectComponentDirectoryReadable(page: Page) {
  const entry = page.locator(".vf-docs-component-entry").first();
  await expect(page.locator(".vf-docs-catalog__jump-nav")).toBeVisible();
  await expect(entry).toBeVisible();
  const width = await entry.evaluate((element) =>
    Math.round(element.getBoundingClientRect().width),
  );
  expect(width).toBeGreaterThan(320);
}

async function expectPackageCatalogReadable(page: Page) {
  const entry = page.locator(".vf-docs-package-entry").first();
  await expect(page.locator(".vf-docs-architecture-rules")).toBeVisible();
  await expect(entry).toBeVisible();
  const width = await entry.evaluate((element) =>
    Math.round(element.getBoundingClientRect().width),
  );
  expect(width).toBeGreaterThan(320);
}

async function expectDiscoveryTilesReadable(
  page: Page,
  selector: ".vf-docs-discovery-tile" | ".vf-docs-pattern-tile",
) {
  const tile = page.locator(selector).first();
  await expect(tile).toBeVisible();
  const width = await tile.evaluate((element) =>
    Math.round(element.getBoundingClientRect().width),
  );
  expect(width).toBeGreaterThan(250);
}

async function expectComponentDetailUseful(page: Page) {
  await page.locator(".vf-docs-component-entry a").first().click();
  await expect(page.locator(".vf-docs-component-doc")).toBeVisible();
  for (const section of [
    "#component-usage",
    "#component-configuration",
    "#component-behavior",
    "#component-accessibility",
    "#component-framework-api",
    "#component-styling",
  ]) {
    await expect(page.locator(section)).toBeVisible();
  }
  await expect(page.locator(".vf-docs-component-doc__example")).toBeVisible();
}

async function expectPackageDetailUseful(page: Page) {
  await page.locator(".vf-docs-package-entry a").first().click();
  await expect(page.locator(".vf-docs-package-doc")).toBeVisible();
  await expect(
    page.getByText("Public package surface", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("What this package owns", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".vf-docs-package-doc__boundaries").first(),
  ).toBeVisible();
}

async function expectTokenDetailUseful(page: Page) {
  await page.locator(".vf-docs-discovery-tile a").first().click();
  await expect(page.locator(".vf-docs-token-doc")).toBeVisible();
  await expect(page.locator(".vf-docs-token-table")).toBeVisible();
  await expect(
    page.getByText("Open interactive token catalog", { exact: true }),
  ).toBeVisible();
}

async function expectPatternDetailUseful(page: Page) {
  await page.locator(".vf-docs-pattern-tile a").first().click();
  await expect(page.locator(".vf-docs-pattern-doc")).toBeVisible();
  await expect(page.locator(".vf-docs-pattern-doc__components")).toBeVisible();
  await expect(
    page.getByText("Library and application boundary", { exact: true }),
  ).toBeVisible();
}

async function expectCodeBlockUsesBlockStyling(page: Page) {
  const code = page.locator(".vf-docs-code-block__pre code").first();
  await expect(code).toBeVisible();

  const style = await code.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      backgroundColor: computed.backgroundColor,
      paddingInlineStart: computed.paddingInlineStart,
    };
  });

  expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(style.paddingInlineStart).toBe("0px");

  const language = page.locator(".vf-docs-code-block__language").first();
  const copy = page.locator(".vf-docs-code-block__copy").first();
  const languageColor = await language.evaluate(
    (element) => getComputedStyle(element).color,
  );
  const copyColor = await copy.evaluate(
    (element) => getComputedStyle(element).color,
  );

  expect(languageColor).toBe("rgb(203, 213, 225)");
  expect(copyColor).toBe("rgb(203, 213, 225)");
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
      if (route !== "overview" && route !== "getting-started") {
        await expectReferenceHero(page);
      }
      if (route === "component-reference") {
        await expectComponentDirectoryReadable(page);
        await capture(page, testInfo, "reference-component-reference");
        await expectComponentDetailUseful(page);
        await expectNoPageOverflow(page);
        await capture(page, testInfo, "reference-component-detail");
        continue;
      }
      if (route === "package-reference") {
        await expectPackageCatalogReadable(page);
        await capture(page, testInfo, "reference-package-reference");
        await expectPackageDetailUseful(page);
        await expectNoPageOverflow(page);
        await capture(page, testInfo, "reference-package-detail");
        continue;
      }
      if (route === "token-reference") {
        await expectDiscoveryTilesReadable(page, ".vf-docs-discovery-tile");
        await capture(page, testInfo, "reference-token-reference");
        await expectTokenDetailUseful(page);
        await expectNoPageOverflow(page);
        await capture(page, testInfo, "reference-token-detail");
        continue;
      }
      if (route === "pattern-reference") {
        await expectDiscoveryTilesReadable(page, ".vf-docs-pattern-tile");
        await capture(page, testInfo, "reference-pattern-reference");
        await expectPatternDetailUseful(page);
        await expectNoPageOverflow(page);
        await capture(page, testInfo, "reference-pattern-detail");
        continue;
      }
      if (route === "executable-examples") {
        await expectCodeBlockUsesBlockStyling(page);
        await expect(
          page.locator(".vf-docs-example-reference__evidence"),
        ).toBeVisible();
      }
      await capture(page, testInfo, `reference-${route}`);
    }
  });

  test("theme, route focus, and search states are accessible", async ({
    page,
  }, testInfo) => {
    await openReference(page, "overview");

    const themeToggle = page.getByRole("button", { name: "Toggle dark theme" });
    await expect(page.locator(".vf-docs-app")).toHaveAttribute(
      "data-theme",
      "light",
    );
    await themeToggle.click();
    await expect(page.locator(".vf-docs-app")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await expect(
      page.getByRole("button", { name: "Toggle light theme" }),
    ).toBeVisible();

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
    await expectNoPageOverflow(page);

    const browse = page.getByRole("button", { name: "Browse", exact: true });
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
