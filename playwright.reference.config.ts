import { defineConfig, devices } from "@playwright/test";

const docsPort = 4174;
const docsBaseUrl = `http://127.0.0.1:${docsPort}`;
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const packagesPrepared = process.env.VYRNFORGE_PACKAGES_PREPARED === "true";

export default defineConfig({
  testDir: "./tests/reference-browser",
  outputDir: "test-results/reference-browser",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: process.env.CI ? [["line"]] : [["list"]],
  use: {
    baseURL: docsBaseUrl,
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
    command: packagesPrepared
      ? `npm run dev --workspace @vyrnforge/ui-docs -- --host 127.0.0.1 --port ${docsPort} --strictPort`
      : `npm run build:packages && npm run dev --workspace @vyrnforge/ui-docs -- --host 127.0.0.1 --port ${docsPort} --strictPort`,
    url: docsBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
