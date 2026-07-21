import { defineConfig, devices } from "@playwright/test";

const fixturePort = 4173;
const fixtureBaseUrl = `http://127.0.0.1:${fixturePort}`;
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "test-results/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: process.env.CI
    ? [
        ["line"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["json", { outputFile: "test-results/browser-results.json" }],
      ]
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ],
  use: {
    baseURL: fixtureBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: chromiumExecutablePath
          ? { executablePath: chromiumExecutablePath }
          : undefined,
      },
    },
  ],
  webServer: {
    command:
      "npm run build:packages && npm run dev --workspace @vyrnforge/ui-regression-fixtures -- --host 127.0.0.1 --port 4173 --strictPort",
    url: fixtureBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
