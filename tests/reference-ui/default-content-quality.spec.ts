import { expect, test, type Page } from "@playwright/test";

async function openReference(page: Page, route: string) {
  await page.goto(`/?framework=react#/${route}`);
  await expect(page.locator(".vf-reference-shell")).toBeVisible();
  await expect(page.locator("#vf-reference-main")).toBeVisible();
}

test.describe("default documentation content quality", () => {
  test("landing family keeps rich orientation and framework context", async ({
    page,
  }) => {
    await openReference(page, "overview");

    const landing = page.locator('.vf-reference-page[data-page-family="landing"]');
    await expect(landing).toBeVisible();
    await expect(
      landing.getByRole("heading", {
        name: "Build once. Stay native to every framework.",
      }),
    ).toBeVisible();
    await expect(landing.getByRole("button", { name: "Start building" })).toBeVisible();
    await expect(
      landing.getByRole("button", { name: "Browse components" }),
    ).toBeVisible();
    await expect(
      landing.locator(".vf-docs-framework-context").getByText("Selected surface"),
    ).toBeVisible();
    await expect(landing.locator(".vf-docs-link-card")).toHaveCount(4);
    await expect(landing.locator(".vf-docs-principle")).toHaveCount(3);
  });

  test("reading family keeps contextual framework controls and numbered hierarchy", async ({
    page,
  }) => {
    await openReference(page, "getting-started");

    const reading = page.locator('.vf-reference-page[data-page-family="reading"]');
    await expect(reading).toBeVisible();
    await expect(
      reading.locator(".vf-docs-framework-context").getByText("Reading for"),
    ).toBeVisible();
    await expect(reading.locator(".vf-docs-reading-outline")).toBeVisible();
    await expect(
      reading.locator(".vf-docs-reading-outline__step").first(),
    ).toHaveText("01");
    await expect(
      reading.locator(".vf-docs-reading-section__step").first(),
    ).toHaveText("01");
  });
});
