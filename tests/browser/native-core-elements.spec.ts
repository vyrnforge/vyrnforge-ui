import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureAction,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

const nativeCoreTags = [
  "vf-text",
  "vf-heading",
  "vf-caption",
  "vf-label",
  "vf-code-text",
  "vf-badge",
  "vf-card",
  "vf-panel",
  "vf-stack",
  "vf-inline",
  "vf-page",
  "vf-section",
  "vf-empty-state",
  "vf-loading-state",
  "vf-error-state",
  "vf-button",
  "vf-icon-button",
  "vf-button-group",
  "vf-toolbar-button",
  "vf-text-input",
  "vf-textarea",
  "vf-search-input",
  "vf-number-input",
  "vf-date-input",
  "vf-datetime-input",
  "vf-checkbox",
  "vf-radio",
  "vf-radio-group",
  "vf-switch",
  "vf-select",
  "vf-slider",
  "vf-rating",
  "vf-toggle-button",
  "vf-toggle-button-group",
  "vf-segmented-control",
  "vf-field",
  "vf-validation-message",
  "vf-tabs",
  "vf-breadcrumbs",
  "vf-side-nav",
] as const;

test.describe("EL-6005 through EL-6011 native core elements", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.nativeCoreElements);
  });

  test("registers the deterministic 40-element public catalog", async ({
    page,
  }) => {
    const registered = await page.evaluate(
      (tags) => tags.map((tag) => Boolean(customElements.get(tag))),
      nativeCoreTags,
    );
    expect(registered).toEqual(nativeCoreTags.map(() => true));
  });

  test("renders shared display styles and dispatches canonical actions", async ({
    page,
  }) => {
    const heading = fixtureRegion(page, "native-core-heading");
    await expect(heading).toHaveAttribute("role", "heading");
    await expect(heading).toHaveAttribute("aria-level", "2");
    await expect(heading).toHaveClass(/vf-heading--lg/);

    await page
      .locator('vf-button[data-vf-fixture-action="native-core-action"] button')
      .click();
    await expect(fixtureRegion(page, "native-core-action")).toHaveText(
      "Native action: create-case",
    );
  });

  test("submits native input, selection, slider, and rating values", async ({
    page,
  }) => {
    const textInput = page.locator(
      'vf-text-input[data-vf-fixture-control="native-text-input"] input',
    );
    await textInput.fill("updated");

    const checkbox = page.locator(
      'vf-checkbox[data-vf-fixture-control="native-checkbox"] input',
    );
    await checkbox.check();

    const select = page.locator(
      'vf-select[data-vf-fixture-control="native-select"] select',
    );
    await select.selectOption("east");

    const slider = page.locator(
      'vf-slider[data-vf-fixture-control="native-slider"] input',
    );
    await slider.fill("4");
    await slider.dispatchEvent("change");

    await page
      .locator(
        'vf-rating[data-vf-fixture-control="native-rating"] button[data-value="5"]',
      )
      .click();
    await fixtureAction(page, "native-core-submit").click();
    await expect(fixtureRegion(page, "native-core-submission")).toHaveText(
      "account=updated, subscribed=yes, region=east, risk=4, rating=5",
    );
  });

  test("keeps field relationships and composite navigation keyboard behavior", async ({
    page,
  }) => {
    const control = page.locator(
      'vf-text-input[data-vf-fixture-control="native-text-input"]',
    );
    await expect(control).toHaveAttribute("aria-required", "true");
    await expect(control).toHaveAttribute("aria-describedby", /description/);

    const segment = page.locator(
      'vf-segmented-control[data-vf-fixture-control="native-segmented"] button[data-value="activity"]',
    );
    await segment.click();
    await expect(fixtureRegion(page, "native-core-segmented")).toHaveText(
      "Segment: activity",
    );

    const summaryTab = page.locator(
      'vf-tabs[data-vf-fixture-control="native-tabs"] [data-tab-id="summary"]',
    );
    await summaryTab.focus();
    await summaryTab.press("ArrowRight");
    await expect(fixtureRegion(page, "native-core-tabs")).toHaveText(
      "Tab: activity",
    );
    await expect(page.locator('vf-tabs [role="tabpanel"]')).toHaveText(
      "Activity panel",
    );

    const overview = page.locator(
      'vf-side-nav[data-vf-fixture-control="native-side-nav"] [data-nav-id="overview"]',
    );
    await overview.focus();
    await overview.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(fixtureRegion(page, "native-core-navigation")).toHaveText(
      "Navigation: members",
    );
  });
});
