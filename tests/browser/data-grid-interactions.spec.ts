import { expect, test } from "@playwright/test";
import { browserFixtureIds, gridCell, openFixture } from "./support/fixtures";

test.describe("VF-2013 data-grid pointer and scrolling contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.dataGridInteractions);
  });

  test("resizes a column with pointer input and resets it with double click", async ({
    page,
  }) => {
    const separator = page.getByRole("separator", {
      name: "Resize Owner column",
    });
    const initialWidth = Number(await separator.getAttribute("aria-valuenow"));
    const box = await separator.boundingBox();

    expect(box, "expected a measurable resize separator").not.toBeNull();
    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 48, box.y + box.height / 2, {
      steps: 6,
    });
    await page.mouse.up();

    await expect
      .poll(async () => Number(await separator.getAttribute("aria-valuenow")))
      .toBeGreaterThanOrEqual(initialWidth + 40);

    await separator.dblclick();
    await expect(separator).toHaveAttribute(
      "aria-valuenow",
      String(initialWidth),
    );
  });

  test("reorders headers with native drag and drop", async ({ page }) => {
    const grid = page.getByRole("grid", {
      name: "Interaction fixture cases data",
    });
    const source = grid.getByRole("button", {
      name: "Reorder Region column",
    });
    const ownerHeader = grid.locator('th[data-udg-column-id="owner"]');

    await source.dragTo(ownerHeader, {
      targetPosition: { x: 2, y: 20 },
    });

    await expect
      .poll(() => grid.locator(".udg-header-label").allTextContents())
      .toEqual(["Case", "Region", "Owner", "Status", "Priority", "Updated"]);
    await expect(
      page.locator('[data-udg-region="interaction-status"]'),
    ).toHaveText("Region column moved before Owner.");
  });

  test("keeps sticky regions visible while keyboard focus scrolls both axes", async ({
    page,
  }) => {
    const scrollContainer = page.locator(
      '[data-udg-region="scroll-container"]',
    );
    const stickyHeader = page.locator('th[data-udg-column-id="id"]');
    const stickySelectionHeader = page.locator(".udg-selection-cell--header");

    await gridCell(page, "case-001", "id").focus();
    await page.keyboard.press("Control+End");
    await expect(gridCell(page, "case-018", "updated")).toBeFocused();

    const scrollPosition = await scrollContainer.evaluate((element) => ({
      left: element.scrollLeft,
      top: element.scrollTop,
    }));
    expect(scrollPosition.left).toBeGreaterThan(0);
    expect(scrollPosition.top).toBeGreaterThan(0);

    const containerBox = await scrollContainer.boundingBox();
    const headerBox = await stickyHeader.boundingBox();
    const selectionBox = await stickySelectionHeader.boundingBox();

    expect(containerBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(selectionBox).not.toBeNull();
    if (!containerBox || !headerBox || !selectionBox) return;

    expect(Math.abs(headerBox.y - containerBox.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(selectionBox.x - containerBox.x)).toBeLessThanOrEqual(2);
  });
});
