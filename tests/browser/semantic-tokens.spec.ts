import { expect, test } from "@playwright/test";

import {
  browserFixtureIds,
  fixtureRegion,
  openFixture,
  setFixtureDensity,
  setFixtureTheme,
} from "./support/fixtures";

const colorRoles = [
  "--vf-surface-page",
  "--vf-surface-default",
  "--vf-text-primary",
  "--vf-text-secondary",
  "--vf-border-default",
  "--vf-interactive-primary",
  "--vf-focus-color",
  "--vf-status-success-text",
  "--vf-status-warning-text",
  "--vf-status-error-text",
  "--vf-status-info-text",
  "--vf-status-pending-text",
  "--vf-status-neutral-text",
] as const;

async function readCustomProperties(
  locator: ReturnType<typeof fixtureRegion>,
  names: readonly string[],
) {
  return locator.evaluate(
    (element, propertyNames) => {
      const styles = getComputedStyle(element);

      return Object.fromEntries(
        propertyNames.map((name) => [
          name,
          styles.getPropertyValue(name).trim(),
        ]),
      );
    },
    [...names],
  );
}

test.describe("VF-3002 through VF-3008 semantic token contract", () => {
  test("resolves the same semantic roles in light and dark themes", async ({
    page,
  }) => {
    await openFixture(page, browserFixtureIds.buttonBasic);
    const fixture = fixtureRegion(page, "fixture");

    const light = await readCustomProperties(fixture, colorRoles);
    await setFixtureTheme(page, "dark");
    const dark = await readCustomProperties(fixture, colorRoles);

    for (const token of colorRoles) {
      expect(light[token], `${token} must resolve in light theme`).not.toBe("");
      expect(dark[token], `${token} must resolve in dark theme`).not.toBe("");
    }

    expect(dark["--vf-surface-page"]).not.toBe(light["--vf-surface-page"]);
    expect(dark["--vf-text-primary"]).not.toBe(light["--vf-text-primary"]);
    expect(dark["--vf-interactive-primary"]).not.toBe(
      light["--vf-interactive-primary"],
    );
  });

  test("supports canonical density names and compatibility aliases", async ({
    page,
  }) => {
    await openFixture(page, browserFixtureIds.buttonBasic);
    const fixture = fixtureRegion(page, "fixture");

    await setFixtureDensity(page, "compact");
    await expect
      .poll(async () =>
        fixture.evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--vf-control-height")
            .trim(),
        ),
      )
      .toBe("30px");

    await setFixtureDensity(page, "standard");
    await expect
      .poll(async () =>
        fixture.evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--vf-control-height")
            .trim(),
        ),
      )
      .toBe("36px");

    await fixture.evaluate((element) =>
      element.setAttribute("data-density", "balanced"),
    );
    await expect
      .poll(async () =>
        fixture.evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--vf-control-height")
            .trim(),
        ),
      )
      .toBe("36px");

    await setFixtureDensity(page, "comfortable");
    await expect
      .poll(async () =>
        fixture.evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--vf-control-height")
            .trim(),
        ),
      )
      .toBe("42px");

    await fixture.evaluate((element) =>
      element.setAttribute("data-density", "spacious"),
    );
    await expect
      .poll(async () =>
        fixture.evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--vf-control-height")
            .trim(),
        ),
      )
      .toBe("42px");
  });

  test("applies reduced-motion fallbacks without hiding state changes", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openFixture(page, browserFixtureIds.buttonBasic);

    const fixture = fixtureRegion(page, "fixture");
    const motion = await readCustomProperties(fixture, [
      "--vf-motion-duration-fast",
      "--vf-motion-duration-standard",
      "--vf-motion-duration-slow",
      "--vf-motion-easing-standard",
    ]);

    expect(motion["--vf-motion-duration-fast"]).toBe("1ms");
    expect(motion["--vf-motion-duration-standard"]).toBe("1ms");
    expect(motion["--vf-motion-duration-slow"]).toBe("1ms");
    expect(motion["--vf-motion-easing-standard"]).toBe("linear");
  });

  test("keeps the documented layer order deterministic", async ({ page }) => {
    await openFixture(page, browserFixtureIds.buttonBasic);
    const fixture = fixtureRegion(page, "fixture");
    const tokens = [
      "--vf-layer-base",
      "--vf-layer-raised",
      "--vf-layer-sticky",
      "--vf-layer-dropdown",
      "--vf-layer-popover",
      "--vf-layer-tooltip",
      "--vf-layer-scrim",
      "--vf-layer-modal",
      "--vf-layer-toast",
      "--vf-layer-debug",
    ] as const;
    const values = await readCustomProperties(fixture, tokens);
    const levels = tokens.map((token) => Number(values[token]));

    expect(levels).toEqual([...levels].sort((left, right) => left - right));
    expect(new Set(levels).size).toBe(levels.length);
  });
});
