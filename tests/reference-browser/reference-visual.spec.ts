import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const artifactDirectory = path.resolve("test-results/reference-visual-evidence");

type ReferenceCase = {
  id: string;
  route: string;
  theme?: "light" | "dark";
  viewport?: { width: number; height: number };
  openMobileNavigation?: boolean;
};

const cases: ReferenceCase[] = [
  { id: "overview-light", route: "/overview" },
  { id: "prose-dark", route: "/getting-started", theme: "dark" },
  { id: "component-index", route: "/component-reference" },
  { id: "component-detail", route: "/components/button" },
  { id: "package-reference", route: "/package-reference" },
  { id: "token-reference", route: "/token-reference" },
  { id: "pattern-reference", route: "/pattern-reference" },
  { id: "examples", route: "/executable-examples" },
  { id: "data-grid", route: "/data-grid" },
  { id: "invalid-route", route: "/reference-route-that-does-not-exist" },
  {
    id: "mobile-navigation",
    route: "/overview",
    viewport: { width: 390, height: 844 },
    openMobileNavigation: true,
  },
];

async function openReference(page: Page, referenceCase: ReferenceCase) {
  if (referenceCase.viewport) {
    await page.setViewportSize(referenceCase.viewport);
  }

  await page.goto(
    `/?framework=react#${referenceCase.route}`,
    { waitUntil: "networkidle" },
  );
  await expect(page.locator(".vf-reference-shell")).toBeVisible();

  if (referenceCase.theme === "dark") {
    await page.getByRole("button", { name: "Toggle dark theme" }).click();
    await expect(page.locator(".vf-docs-app")).toHaveAttribute(
      "data-theme",
      "dark",
    );
  }

  if (referenceCase.openMobileNavigation) {
    await page.getByRole("button", { name: "Browse" }).click();
    await expect(
      page.getByRole("dialog", { name: "VyrnForge Reference" }),
    ).toBeVisible();
  }

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test.describe("P0 Reference visual matrix", () => {
  for (const referenceCase of cases) {
    test(referenceCase.id, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openReference(page, referenceCase);

      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(pageOverflow, "page must not overflow horizontally").toBe(false);

      await mkdir(artifactDirectory, { recursive: true });
      const screenshot = await page.screenshot({
        animations: "disabled",
        caret: "hide",
        fullPage: true,
        path: path.join(artifactDirectory, `${referenceCase.id}.png`),
      });

      await testInfo.attach(`${referenceCase.id}.png`, {
        body: screenshot,
        contentType: "image/png",
      });
    });
  }
});
