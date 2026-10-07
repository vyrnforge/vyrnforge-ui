import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const evidenceDirectory = path.resolve("test-results/reference-ui-evidence");

async function captureBenchmark(page: import("@playwright/test").Page) {
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, "reference-component-button-benchmark.png"),
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
}

test.describe("component reference presentation benchmark", () => {
  test("Button establishes the reusable component-documentation benchmark", async ({
    page,
  }) => {
    await page.goto("/?framework=react#/components/button");

    await expect(page.locator("#component-overview")).toContainText("Button");
    await expect(
      page.locator("#component-specimen .vf-docs-component-specimen__stage"),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button", { hasText: "Primary" }),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button", { hasText: "Danger" }),
    ).toBeVisible();

    const usageCards = page.locator(
      "#component-usage > .vf-docs-contract-field",
    );
    await expect(usageCards).toHaveCount(2);
    await expect(usageCards.first()).toContainText("Use when");
    await expect(usageCards.nth(1)).toContainText("When not to use");

    await expect(page.locator("#component-capabilities")).toBeVisible();
    await expect(page.locator("#component-accessibility")).toBeVisible();
    await expect(
      page.locator("#component-framework-usage pre").first(),
    ).toBeVisible();
    await expect(page.locator("#component-generated-api")).toBeVisible();
    await expect(page.locator(".vf-docs-reference-outline")).toBeVisible();

    const cards = page.locator(
      ".vf-docs-reference > .vf-docs-reference__section, .vf-docs-component-specimen",
    );
    expect(await cards.count()).toBeGreaterThan(5);

    const presentation = await page
      .locator("#component-overview")
      .evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          background: style.backgroundImage,
          borderRadius: style.borderRadius,
        };
      });
    expect(presentation.background).not.toBe("none");
    expect(presentation.borderRadius).not.toBe("0px");

    await captureBenchmark(page);
  });

  test("the same presentation applies to another generated component record", async ({
    page,
  }) => {
    await page.goto("/?framework=react#/components/text-input");

    await expect(page.locator("#component-overview")).toContainText("TextInput");
    await expect(
      page.locator("#component-specimen .vf-input"),
    ).toBeVisible();
    await expect(
      page.locator("#component-usage > .vf-docs-contract-field"),
    ).toHaveCount(2);
    await expect(page.locator("#component-accessibility")).toBeVisible();
    await expect(page.locator("#component-generated-api")).toBeVisible();
  });
});
