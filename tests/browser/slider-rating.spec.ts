import { expect, test } from "@playwright/test";
import {
  browserFixtureIds,
  fixtureRegion,
  openFixture,
} from "./support/fixtures";

test.describe("VF-2009 Slider and Rating browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, browserFixtureIds.sliderRatingKeyboard);
  });

  test("updates the native slider with arrow, Home, and End keys", async ({
    page,
  }) => {
    const slider = page.getByRole("slider", { name: "Approval threshold" });
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("45");
    await expect(fixtureRegion(page, "slider-value")).toHaveText(
      "Threshold: 45",
    );

    await page.keyboard.press("Home");
    await expect(slider).toHaveValue("0");
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("100");
  });

  test("uses native radio keyboard behavior and supports clearing", async ({
    page,
  }) => {
    const second = page.getByRole("radio", { name: "2 of 5 stars" });
    await expect(second).toBeChecked();
    await second.focus();
    await page.keyboard.press("ArrowRight");

    const third = page.getByRole("radio", { name: "3 of 5 stars" });
    await expect(third).toBeChecked();
    await expect(fixtureRegion(page, "rating-value")).toHaveText("Rating: 3");

    await third.click();
    await expect(fixtureRegion(page, "rating-value")).toHaveText("Rating: 0");
    await expect(
      page.getByRole("img", { name: "Archived quality: 4 of 5 stars" }),
    ).toBeVisible();
  });
});
