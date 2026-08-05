import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
  setFixtureDensity,
  setFixtureTheme,
} from "./support/fixtures";

test.describe("VF-2001 browser foundation", () => {
  test("resolves deterministic fixture and not-found routes", async ({
    page,
  }) => {
    await openFixture(page, browserFixtureIds.buttonBasic);
    await expect(
      page.getByRole("heading", { name: "Button basic" }),
    ).toBeVisible();

    await page.goto("/fixtures/unknown-browser-route");
    await expect(fixtureRegion(page, "not-found")).toBeVisible();
    await expect(
      page.getByText("Unknown fixture route: /fixtures/unknown-browser-route"),
    ).toBeVisible();
  });

  test("switches fixture theme and density in a real browser", async ({
    page,
  }) => {
    await openFixture(page, browserFixtureIds.buttonBasic);

    await setFixtureTheme(page, "dark");
    await setFixtureDensity(page, "compact");
  });

  test("interacts with a basic control fixture", async ({ page }) => {
    await openFixture(page, browserFixtureIds.buttonBasic);

    await fixtureAction(page, "primary").click();
    await expect(fixtureRegion(page, "result")).toHaveText("Case created");
  });

  test("opens and closes an overlay fixture", async ({ page }) => {
    await openFixture(page, browserFixtureIds.dialogFocus);

    await fixtureAction(page, "open-dialog").click();
    await expect(
      page.getByRole("dialog", { name: "Confirm case update" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close dialog" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("renders the deterministic data-grid fixture", async ({ page }) => {
    await openFixture(page, browserFixtureIds.dataGridSelection);

    await expect(
      page.getByRole("region", { name: "Fixture cases" }),
    ).toBeVisible();
    await expect(page.getByText("case-100", { exact: true })).toBeVisible();
    await expect(page.getByText("case-300", { exact: true })).toBeVisible();
  });
});
