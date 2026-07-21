import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2008 Transfer List browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.transferListAssignment);
  });

  test("moves selected items in both directions with native keyboard controls", async ({
    page,
  }) => {
    const identity = page.getByRole("checkbox", {
      name: /Identity and Access Management/,
    });
    await identity.focus();
    await page.keyboard.press("Space");
    await page
      .getByRole("button", {
        name: "Move selected items to Assigned applications",
      })
      .click();

    await expect(fixtureRegion(page, "transfer-list-value")).toHaveText(
      "Assigned applications: iam, analytics",
    );

    const assignedIdentity = page.getByRole("checkbox", {
      name: /Identity and Access Management/,
    });
    await assignedIdentity.check();
    await page
      .getByRole("button", {
        name: "Move selected items to Available applications",
      })
      .click();
    await expect(fixtureRegion(page, "transfer-list-value")).toHaveText(
      "Assigned applications: analytics",
    );
  });

  test("filters visible items, selects visible results, and protects disabled items", async ({
    page,
  }) => {
    const sourcePanel = page.getByRole("group", {
      name: /Available applications/,
    });
    await sourcePanel
      .getByRole("searchbox", { name: "Search available" })
      .fill("report");
    await sourcePanel.getByRole("checkbox", { name: "Select visible" }).check();
    await page
      .getByRole("button", {
        name: "Move selected items to Assigned applications",
      })
      .click();
    await expect(fixtureRegion(page, "transfer-list-value")).toHaveText(
      "Assigned applications: analytics, reporting",
    );

    await sourcePanel
      .getByRole("searchbox", { name: "Search available" })
      .fill("");
    await expect(
      sourcePanel.getByRole("checkbox", { name: /API Gateway/ }),
    ).toBeDisabled();
  });
});
