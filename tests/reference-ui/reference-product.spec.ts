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

async function expectDiscoveryCatalogReadable(page: Page) {
  const row = page.locator(".vf-docs-discovery-catalog-row").first();
  await expect(row).toBeVisible();

  const metrics = await row.evaluate((element) => {
    const description = element.querySelector<HTMLElement>(".vf-text");
    const rowBounds = element.getBoundingClientRect();
    const descriptionBounds = description?.getBoundingClientRect();
    return {
      descriptionWidth: Math.round(descriptionBounds?.width ?? 0),
      rowWidth: Math.round(rowBounds.width),
    };
  });

  expect(metrics.rowWidth).toBeGreaterThan(600);
  expect(metrics.descriptionWidth).toBeGreaterThan(260);
}

async function expectPackageFactsReadable(page: Page) {
  const facts = page.locator(".vf-docs-package-row__facts").first();
  await expect(facts).toBeVisible();

  const metrics = await facts.evaluate((element) => {
    const labels = [...element.querySelectorAll<HTMLElement>("strong")];
    const apiLabel = labels.find(
      (label) => label.textContent?.trim() === "API documentation",
    );
    const bounds = apiLabel?.getBoundingClientRect();
    return {
      height: Math.round(bounds?.height ?? 0),
      width: Math.round(bounds?.width ?? 0),
    };
  });

  expect(metrics.width).toBeGreaterThan(120);
  expect(metrics.height).toBeLessThan(40);
}

function parseRgb(color: string) {
  const values = color.match(/[\d.]+/gu)?.map(Number) ?? [];
  return values.slice(0, 3);
}

function relativeLuminance([red, green, blue]: number[]) {
  const channels = [red, green, blue].map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(parseRgb(foreground));
  const backgroundLuminance = relativeLuminance(parseRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
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

  const toolbar = page.locator(".vf-docs-code-block__toolbar").first();
  const language = page.locator(".vf-docs-code-block__language").first();
  const copy = page.locator(".vf-docs-code-block__copy").first();
  const contrast = await toolbar.evaluate((element) => {
    const background = getComputedStyle(element).backgroundColor;
    return { background };
  });
  const languageColor = await language.evaluate(
    (element) => getComputedStyle(element).color,
  );
  const copyColor = await copy.evaluate(
    (element) => getComputedStyle(element).color,
  );
  const blockBackground = await page
    .locator(".vf-docs-code-block")
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  const toolbarBackground =
    contrast.background === "rgba(0, 0, 0, 0)"
      ? blockBackground
      : contrast.background;

  expect(contrastRatio(languageColor, toolbarBackground)).toBeGreaterThanOrEqual(
    4.5,
  );
  expect(contrastRatio(copyColor, toolbarBackground)).toBeGreaterThanOrEqual(
    4.5,
  );
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
      if (route === "token-reference" || route === "pattern-reference") {
        await expectDiscoveryCatalogReadable(page);
      }
      if (route === "package-reference") {
        await expectPackageFactsReadable(page);
      }
      if (route === "executable-examples") {
        await expectCodeBlockUsesBlockStyling(page);
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
