import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const evidenceDirectory = path.resolve("test-results/reference-ui-evidence");

async function captureBenchmark(page: Page) {
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(
      evidenceDirectory,
      "reference-component-button-benchmark.png",
    ),
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
}

test.describe("component reference presentation benchmark", () => {
  test("Button establishes the human-first component-documentation benchmark", async ({
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

    const buttonExamples = page.locator(
      "#component-specimen .vf-docs-button-example-group",
    );
    await expect(buttonExamples).toHaveCount(6);
    await expect(buttonExamples.nth(0)).toContainText("Variants");
    await expect(buttonExamples.nth(1)).toContainText("Sizes");
    await expect(buttonExamples.nth(2)).toContainText("Disabled and loading");
    await expect(buttonExamples.nth(3)).toContainText("Full width");
    await expect(buttonExamples.nth(4)).toContainText("Icons and labels");
    await expect(buttonExamples.nth(5)).toContainText("Form actions");

    await expect(
      page.locator("#component-specimen .vf-button--sm", { hasText: "Small" }),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button--md", {
        hasText: "Medium",
      }),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button--lg", { hasText: "Large" }),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button", { hasText: "Disabled" }),
    ).toBeDisabled();
    await expect(
      page.locator("#component-specimen .vf-button[aria-busy='true']", {
        hasText: "Saving",
      }),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button--full-width", {
        hasText: "Continue",
      }),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button[type='submit']", {
        hasText: "Save changes",
      }),
    ).toBeVisible();
    await expect(
      page.locator("#component-specimen .vf-button[type='reset']", {
        hasText: "Reset",
      }),
    ).toBeVisible();

    const usageCards = page.locator("#component-usage .vf-docs-guidance-card");
    await expect(usageCards).toHaveCount(2);
    await expect(usageCards.first()).toContainText("Use it when");
    await expect(usageCards.nth(1)).toContainText(
      "Choose another approach when",
    );

    await expect(page.locator("#component-capabilities")).toContainText(
      "Customization",
    );
    await expect(page.locator("#component-accessibility")).toBeVisible();
    await expect(page.locator("#component-example-code")).toContainText(
      "React example",
    );
    await expect(page.locator("#component-framework-usage")).toHaveCount(0);
    await expect(page.locator("#component-generated-api")).toBeVisible();
    await expect(page.locator(".vf-docs-reference-outline")).toBeVisible();

    const specimenPresentation = await page
      .locator("#component-specimen .vf-docs-component-specimen__stage")
      .evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          borderRadius: style.borderRadius,
          minHeight: style.minHeight,
        };
      });
    expect(specimenPresentation.borderRadius).not.toBe("0px");
    expect(Number.parseFloat(specimenPresentation.minHeight)).toBeGreaterThan(
      0,
    );

    const overviewPresentation = await page
      .locator("#component-overview")
      .evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          backgroundImage: style.backgroundImage,
          boxShadow: style.boxShadow,
        };
      });
    expect(overviewPresentation.backgroundImage).toBe("none");
    expect(overviewPresentation.boxShadow).toBe("none");

    await captureBenchmark(page);
  });

  test("the same human-first presentation applies to another generated record", async ({
    page,
  }) => {
    await page.goto("/?framework=react#/components/text-input");

    await expect(page.locator("#component-overview")).toContainText(
      "TextInput",
    );
    await expect(page.locator("#component-specimen .vf-input")).toBeVisible();
    await expect(
      page.locator("#component-usage .vf-docs-guidance-card"),
    ).toHaveCount(2);
    await expect(page.locator("#component-example-code")).toContainText(
      "React example",
    );
    await expect(page.locator("#component-accessibility")).toBeVisible();
    await expect(page.locator("#component-generated-api")).toBeVisible();
  });
});
