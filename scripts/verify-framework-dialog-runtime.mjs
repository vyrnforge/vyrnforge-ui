import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const npmCliPath = process.env.npm_execpath;

const fixtures = Object.freeze([
  Object.freeze({
    id: "native-html",
    directory: "tests/consumers/native-html",
    port: 4181,
    opener: "#native-dialog [data-dialog-trigger]",
    dialog: '#native-dialog[data-vf-generated-dialog="native"]',
    root: "[data-consumer-root]",
  }),
  Object.freeze({
    id: "react",
    directory: "tests/consumers/react",
    port: 4182,
    opener: 'vf-dialog[data-vf-generated-dialog="react"] [data-dialog-trigger]',
    dialog: 'vf-dialog[data-vf-generated-dialog="react"]',
    root: "[data-react-consumer]",
  }),
  Object.freeze({
    id: "angular",
    directory: "tests/consumers/angular",
    port: 4183,
    opener:
      'vf-dialog[data-vf-generated-dialog="angular"] [data-dialog-trigger]',
    dialog: 'vf-dialog[data-vf-generated-dialog="angular"]',
    root: "[data-angular-consumer]",
  }),
  Object.freeze({
    id: "vue",
    directory: "tests/consumers/vue",
    port: 4184,
    opener: 'vf-dialog[data-vf-generated-dialog="vue"] [data-dialog-trigger]',
    dialog: 'vf-dialog[data-vf-generated-dialog="vue"]',
    root: "[data-vue-consumer]",
  }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function npmSpawnArguments(args) {
  if (npmCliPath) {
    return { command: process.execPath, args: [npmCliPath, ...args] };
  }
  return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args,
  };
}

async function waitForServer(url, processHandle) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (processHandle.exitCode !== null) {
      throw new Error(
        `Preview server exited with code ${processHandle.exitCode}`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry while the preview server starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function waitForProcessExit(processHandle, timeoutMs) {
  if (!processHandle || processHandle.exitCode !== null) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (exited) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      processHandle.off("exit", onExit);
      resolve(exited);
    };
    const onExit = () => finish(true);
    const timer = setTimeout(() => finish(false), timeoutMs);
    processHandle.once("exit", onExit);
  });
}

async function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  if (process.platform === "win32") {
    processHandle.kill();
    await waitForProcessExit(processHandle, 5_000);
    return;
  }

  const signalGroup = (signal) => {
    try {
      process.kill(-processHandle.pid, signal);
    } catch {
      try {
        processHandle.kill(signal);
      } catch {
        // The process already exited.
      }
    }
  };

  signalGroup("SIGTERM");
  if (!(await waitForProcessExit(processHandle, 5_000))) {
    signalGroup("SIGKILL");
    await waitForProcessExit(processHandle, 5_000);
  }
}

async function verifyDialogFixture(browser, fixture) {
  const preview = npmSpawnArguments([
    "run",
    "preview",
    "--",
    "--host",
    "127.0.0.1",
    "--port",
    String(fixture.port),
    "--strictPort",
  ]);
  const fixtureDirectory = path.join(repositoryRoot, fixture.directory);
  const url = `http://127.0.0.1:${fixture.port}`;
  const server = spawn(preview.command, preview.args, {
    cwd: fixtureDirectory,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
  });
  let serverOutput = "";
  server.stdout?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  const context = await browser.newContext();
  try {
    await waitForServer(url, server);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-consumer-ready="true"]');

    const opener = page.locator(fixture.opener);
    const dialog = page.locator(fixture.dialog);
    await opener.waitFor({ state: "visible" });
    await dialog.waitFor({ state: "attached" });

    assert(
      (await dialog.evaluate((element) => element.tagName)) === "VF-DIALOG",
      `${fixture.id}: generated Dialog did not retain the canonical vf-dialog renderer`,
    );
    assert(
      await dialog.evaluate(
        (element) =>
          typeof element.show === "function" &&
          typeof element.close === "function" &&
          typeof element.focus === "function",
      ),
      `${fixture.id}: generated Dialog methods are not exposed by the canonical renderer`,
    );

    await opener.click();
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.open === true,
      fixture.dialog,
    );
    await page.waitForFunction((selector) => {
      const dialogElement = document.querySelector(selector);
      const active = document.activeElement;
      return Boolean(dialogElement && active && dialogElement.contains(active));
    }, fixture.dialog);

    await page.keyboard.press("Shift+Tab");
    assert(
      await dialog.evaluate(
        (element) =>
          document.activeElement !== null &&
          element.contains(document.activeElement),
      ),
      `${fixture.id}: modal Dialog did not contain backward Tab focus`,
    );

    await page.keyboard.press("Tab");
    assert(
      await dialog.evaluate(
        (element) =>
          document.activeElement !== null &&
          element.contains(document.activeElement),
      ),
      `${fixture.id}: modal Dialog did not contain forward Tab focus`,
    );

    await page.keyboard.press("Escape");
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.open === false,
      fixture.dialog,
    );
    await page.waitForFunction(
      (selector) => document.activeElement === document.querySelector(selector),
      fixture.opener,
    );

    assert(
      (await page
        .locator(fixture.root)
        .getAttribute("data-generated-dialog-open")) === "false",
      `${fixture.id}: framework open-state mapping did not observe Escape dismissal`,
    );
    assert(
      (await page
        .locator(fixture.root)
        .getAttribute("data-generated-dialog-dismiss")) === "escape-key",
      `${fixture.id}: framework dismissal mapping did not expose escape-key`,
    );

    await dialog.evaluate((element) => element.show());
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.open === true,
      fixture.dialog,
    );
    await dialog.evaluate((element) => element.focus());
    assert(
      await dialog.evaluate(
        (element) =>
          document.activeElement !== null &&
          element.contains(document.activeElement),
      ),
      `${fixture.id}: Dialog focus() did not focus the overlay`,
    );
    await dialog.evaluate((element) => element.close());
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.open === false,
      fixture.dialog,
    );

    await page.close();
    console.log(
      `DIALOG ${fixture.id}: trigger, focus containment/restoration, Escape dismissal, model mapping, and methods passed.`,
    );
  } catch (error) {
    throw new Error(
      `${fixture.id} Dialog runtime verification failed: ${error.message}\n${serverOutput}`,
      { cause: error },
    );
  } finally {
    await context.close();
    await stopProcess(server);
    server.stdout?.destroy();
    server.stderr?.destroy();
  }
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
try {
  for (const fixture of fixtures) {
    await verifyDialogFixture(browser, fixture);
  }
} finally {
  await browser.close();
}

console.log(
  `MFD-1115 Dialog runtime passed across ${fixtures.length} framework surfaces.`,
);
