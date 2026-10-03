import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const artifactDirectory = path.resolve("test-results/reference-visual-evidence");

type ReferenceCase = {
  id: string;
  route: string;
  framework?: "native-html" | "react" | "angular" | "vue";
  member?: string;
  theme?: "light" | "dark";
  viewport?: { width: number; height: number };
  expectedText?: string;
  openMobileNavigation?: boolean;
};

const cases: ReferenceCase[] = [
  { id: "overview-light", route: "/overview" },
  { id: "prose-dark", route: "/getting-started", theme: "dark" },
  { id: "component-index", route: "/component-reference" },
  { id: "component-detail", route: "/components/button" },
  { id: "package-reference", route: "/package-reference" },
  { id: "token-reference", route: "/token-reference" },
  {
    id: "pattern-reference-tablet",
    route: "/pattern-reference",
    viewport: { width: 820, height: 1180 },
  },
  { id: "examples", route: "/executable-examples" },
  { id: "data-grid-react", route: "/data-grid" },
  {
    id: "data-grid-angular-unavailable",
    route: "/data-grid",
    framework: "angular",
    expectedText: "Unavailable in this context",
  },
  {
    id: "missing-component",
    route: "/components/reference-component-that-does-not-exist",
    expectedText: "Component not found",
  },
  {
    id: "invalid-route",
    route: "/reference-route-that-does-not-exist",
    expectedText: "Page not found",
  },
  {
    id: "missing-member-deep-link",
    route: "/components/button",
    member: "api-property-that-does-not-exist",
  },
  {
    id: "mobile-navigation",
    route: "/overview",
    viewport: { width: 390, height: 844 },
    openMobileNavigation: true,
  },
];

function referenceUrl(referenceCase: ReferenceCase) {
  const query = new URLSearchParams({
    framework: referenceCase.framework ?? "react",
  });
  if (referenceCase.member) query.set("member", referenceCase.member);
  return `/?${query.toString()}#${referenceCase.route}`;
}

async function openReference(page: Page, referenceCase: ReferenceCase) {
  if (referenceCase.viewport) {
    await page.setViewportSize(referenceCase.viewport);
  }

  await page.goto(referenceUrl(referenceCase), { waitUntil: "networkidle" });
  await expect(page.locator(".vf-reference-shell")).toBeVisible();

  if (referenceCase.theme === "dark") {
    await page.getByRole("button", { name: "Toggle dark theme" }).click();
    await expect(page.locator(".vf-docs-app")).toHaveAttribute(
      "data-theme",
      "dark",
    );
  }

  if (referenceCase.expectedText) {
    await expect(page.getByText(referenceCase.expectedText)).toBeVisible();
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

      if (referenceCase.member) {
        await expect(page.locator("#vf-reference-main")).toBeFocused();
      }

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

test("representative templates expose keyboard-reachable Reference controls", async ({
  page,
}) => {
  for (const route of [
    "/overview",
    "/getting-started",
    "/component-reference",
    "/package-reference",
    "/token-reference",
    "/pattern-reference",
    "/executable-examples",
    "/data-grid",
  ]) {
    await openReference(page, { id: route, route });
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
    await expect(focused).not.toHaveAttribute("tabindex", "-1");
  }
});
