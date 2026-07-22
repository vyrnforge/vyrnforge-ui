import { expect, type Locator, type Page } from "@playwright/test";
import { fixtureById } from "../../../apps/regression-fixtures/src/fixtureRegistry";

export type BrowserFixtureId =
  (typeof browserFixtureIds)[keyof typeof browserFixtureIds];

export const browserFixtureIds = {
  autocompleteControlled: "autocomplete-controlled",
  buttonBasic: "button-basic",
  dataGridInteractions: "data-grid-interactions",
  dataGridKeyboard: "data-grid-keyboard",
  dataGridSelection: "data-grid-selection",
  dialogFocus: "dialog-focus",
  drawerFocus: "drawer-focus",
  menuKeyboard: "menu-keyboard",
  multiSelectKeyboard: "multi-select-keyboard",
  popoverPosition: "popover-position",
  sliderRatingKeyboard: "slider-rating-keyboard",
  tabsToggleKeyboard: "tabs-toggle-keyboard",
  toastLifecycle: "toast-lifecycle",
  tooltipFocusHover: "tooltip-focus-hover",
  transferListAssignment: "transfer-list-assignment",
  visualComponents: "visual-components",
} as const;

export async function openFixture(page: Page, fixtureId: string) {
  const fixture = fixtureById.get(fixtureId);
  if (!fixture) {
    throw new Error(`Unknown browser fixture ID: ${fixtureId}`);
  }

  await page.goto(fixture.route);
  const root = page.locator(
    `[data-vf-fixture="${fixture.id}"][data-vf-fixture-ready="true"]`,
  );
  await expect(root).toBeVisible();
  return root;
}

export function fixtureAction(page: Page, action: string) {
  return page.locator(`[data-vf-fixture-action="${action}"]`);
}

export function fixtureRegion(page: Page, region: string) {
  return page.locator(`[data-vf-fixture-region="${region}"]`);
}

export function gridCell(page: Page, rowId: string, columnId: string) {
  return page.locator(
    `[data-udg-row-id="${rowId}"] [data-udg-column-id="${columnId}"]`,
  );
}

export async function setFixtureTheme(page: Page, theme: "light" | "dark") {
  await page
    .getByRole("combobox", { name: "Fixture theme" })
    .selectOption(theme);
  await expect(fixtureRegion(page, "fixture")).toHaveAttribute(
    "data-theme",
    theme,
  );
}

export async function setFixtureDensity(
  page: Page,
  density: "compact" | "standard" | "comfortable",
) {
  await page
    .getByRole("combobox", { name: "Fixture density" })
    .selectOption(density);
  await expect(fixtureRegion(page, "fixture")).toHaveAttribute(
    "data-density",
    density,
  );
}

export async function expectWithinViewport(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box, "expected a measurable browser element").not.toBeNull();
  expect(viewport, "expected a configured browser viewport").not.toBeNull();
  if (!box || !viewport) return;

  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
}
