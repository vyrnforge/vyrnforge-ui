import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";

import visualMatrix from "../../docs/metadata/visual-regression-matrix.json";
import {
  fixtureAction,
  openFixture,
  setFixtureDensity,
  setFixtureTheme,
} from "./support/fixtures";

type VisualExpectation = {
  property: string;
  token: string;
};

type VisualTarget = {
  id: string;
  selector: string;
  expectations: VisualExpectation[];
};

type VisualSuite = {
  id: string;
  title: string;
  fixtureId: string;
  themes: Array<"light" | "dark">;
  densities: Array<"compact" | "standard" | "comfortable">;
  tokenRootSelector: string;
  screenshotSelector: string;
  actions: string[];
  targets: VisualTarget[];
};

type VisualObservation = {
  target: string;
  property: string;
  token: string;
  actual: string;
  expected: string;
};

function normalizeComputedValue(value: string) {
  return value
    .trim()
    .replace(/\s*,\s*/gu, ", ")
    .replace(/\s+/gu, " ");
}

async function resolveTokenValue(
  tokenRoot: Locator,
  property: string,
  token: string,
) {
  return tokenRoot.evaluate(
    (root, input) => {
      const probe = document.createElement("span");
      probe.setAttribute("aria-hidden", "true");
      probe.style.position = "absolute";
      probe.style.inset = "0 auto auto 0";
      probe.style.display = "block";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      probe.style.setProperty(input.property, `var(${input.token})`);
      root.append(probe);

      const value = getComputedStyle(probe)
        .getPropertyValue(input.property)
        .trim();
      probe.remove();
      return value;
    },
    { property, token },
  );
}

async function observeTarget(
  page: Page,
  tokenRoot: Locator,
  target: VisualTarget,
) {
  const locator = page.locator(target.selector).first();
  await expect(locator, `${target.id} must be visible`).toBeVisible();

  const observations: VisualObservation[] = [];

  for (const expectation of target.expectations) {
    const actual = normalizeComputedValue(
      await locator.evaluate((element, property) => {
        return getComputedStyle(element).getPropertyValue(property).trim();
      }, expectation.property),
    );
    const expected = normalizeComputedValue(
      await resolveTokenValue(
        tokenRoot,
        expectation.property,
        expectation.token,
      ),
    );

    observations.push({
      target: target.id,
      property: expectation.property,
      token: expectation.token,
      actual,
      expected,
    });

    expect(
      actual,
      `${target.id} ${expectation.property} must resolve from ${expectation.token}`,
    ).toBe(expected);
  }

  return observations;
}

async function prepareVisualCase(
  page: Page,
  suite: VisualSuite,
  theme: "light" | "dark",
  density: "compact" | "standard" | "comfortable",
) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture(page, suite.fixtureId);
  await setFixtureTheme(page, theme);
  await setFixtureDensity(page, density);

  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await expect(page.locator("html")).toHaveAttribute("data-density", density);

  for (const action of suite.actions) {
    await fixtureAction(page, action).click();
  }

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test.describe("VF-3011 semantic visual-regression matrix", () => {
  test.describe.configure({ mode: "parallel" });

  for (const suite of visualMatrix.suites as VisualSuite[]) {
    for (const theme of suite.themes) {
      for (const density of suite.densities) {
        const caseId = `${suite.id}-${theme}-${density}`;

        test(`${suite.title}: ${theme}/${density}`, async ({
          page,
        }, testInfo) => {
          await prepareVisualCase(page, suite, theme, density);

          const tokenRoot = page.locator(suite.tokenRootSelector).first();
          await expect(tokenRoot).toBeVisible();

          const observations: VisualObservation[] = [];
          for (const target of suite.targets) {
            observations.push(
              ...(await observeTarget(page, tokenRoot, target)),
            );
          }

          const screenshotTarget = page
            .locator(suite.screenshotSelector)
            .first();
          await expect(screenshotTarget).toBeVisible();

          const screenshot = await screenshotTarget.screenshot({
            animations: "disabled",
            caret: "hide",
          });
          const artifactDirectory = path.resolve(
            visualMatrix.runner.artifactDirectory,
          );
          const screenshotPath = path.join(artifactDirectory, `${caseId}.png`);
          const contractPath = path.join(artifactDirectory, `${caseId}.json`);

          await mkdir(artifactDirectory, { recursive: true });
          await writeFile(screenshotPath, screenshot);
          await writeFile(
            contractPath,
            `${JSON.stringify(
              {
                caseId,
                fixtureId: suite.fixtureId,
                theme,
                density,
                observations,
              },
              null,
              2,
            )}\n`,
            "utf8",
          );

          await testInfo.attach(`${caseId}.png`, {
            body: screenshot,
            contentType: "image/png",
          });
          await testInfo.attach(`${caseId}.json`, {
            body: Buffer.from(
              JSON.stringify({ caseId, observations }, null, 2),
              "utf8",
            ),
            contentType: "application/json",
          });
        });
      }
    }
  }
});
