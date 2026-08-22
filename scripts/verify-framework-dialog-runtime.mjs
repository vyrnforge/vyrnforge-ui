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
    opener: "#native-dialog-open > button[data-vf-action-control]",
    dialog: '#native-dialog[data-vf-generated-dialog="native"]',
  }),
  Object.freeze({
    id: "react",
    directory: "tests/consumers/react",
    port: 4182,
    opener:
      "[data-react-dialog-opener] vf-button > button[data-vf-action-control]",
    dialog: 'vf-dialog[data-vf-generated-dialog="react"]',
  }),
  Object.freeze({
    id: "angular",
    directory: "tests/consumers/angular",
    port: 4183,
    opener: "#angular-dialog-open > button[data-vf-action-control]",
    dialog: 'vf-dialog[data-vf-generated-dialog="angular"]',
  }),
  Object.freeze({
    id: "vue",
    directory: "tests/consumers/vue",
    port: 4184,
    opener: "#vue-dialog-open > button[data-vf-action-control]",
    dialog: 'vf-dialog[data-vf-generated-dialog="vue"]',
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

    const firstFocusedTag = await page.evaluate(
      () => document.activeElement?.tagName ?? null,
    );
    assert(
      firstFocusedTag !== "BODY",
      `${fixture.id}: Dialog opening did not move focus into the overlay`,
    );

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
      (await opener.evaluate(
        (element) => document.activeElement === element,
      )) === true,
      `${fixture.id}: Dialog did not restore focus to its opener`,
    );
    assert(
      (await page
        .locator(
          fixture.id === "native-html"
            ? "[data-consumer-root]"
            : `[data-${fixture.id === "react" ? "react" : fixture.id}-consumer]`,
        )
        .getAttribute("data-generated-dialog-open")) === "false",
      `${fixture.id}: framework open-state mapping did not observe Escape dismissal`,
    );

    await page.close();
    console.log(
      `DIALOG ${fixture.id}: open, focus containment, Escape, model update, and focus restoration passed.`,
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
