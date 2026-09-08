import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "@playwright/test";
import {
  getReleaseGroup,
  getReleasePackageMap,
  readReleaseGroups,
} from "./release-groups.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const rootRequire = createRequire(import.meta.url);
const axeSource = rootRequire("axe-core").source;
const npmCliPath = process.env.npm_execpath;
const tempPackageDir = path.join(
  repositoryRoot,
  "tests/consumers/.tmp-packages",
);

const packageDefinitions = [
  { name: "@vyrnforge/ui-core", directory: "packages/ui-core" },
  { name: "@vyrnforge/ui-behaviors", directory: "packages/ui-behaviors" },
  { name: "@vyrnforge/ui-components", directory: "packages/ui-components" },
  {
    name: "@vyrnforge/ui-elements",
    directory: "packages/ui-elements",
    customElements: true,
  },
  { name: "@vyrnforge/ui-angular", directory: "packages/ui-angular" },
];

const allFixtures = [
  {
    id: "native-html",
    directory: "tests/consumers/native-html",
    outputDirectory: "dist",
    port: 4181,
    packageNames: [
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-elements",
    ],
  },
  {
    id: "react",
    directory: "tests/consumers/react",
    outputDirectory: "dist",
    port: 4182,
    packageNames: [
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-components",
      "@vyrnforge/ui-elements",
    ],
  },
  {
    id: "angular",
    directory: "tests/consumers/angular",
    outputDirectory: "dist/vyrnforge-angular-consumer-fixture/browser",
    port: 4183,
    packageNames: [
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-elements",
    ],
    packedPackageNames: [
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-elements",
      "@vyrnforge/ui-angular",
    ],
  },
  {
    id: "vue",
    directory: "tests/consumers/vue",
    outputDirectory: "dist",
    port: 4184,
    packageNames: [
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-elements",
    ],
  },
];

const fixtureArgumentIndex = process.argv.indexOf("--fixture");
const requestedFixture =
  fixtureArgumentIndex >= 0 ? process.argv[fixtureArgumentIndex + 1] : null;
const fixtures = requestedFixture
  ? allFixtures.filter((fixture) => fixture.id === requestedFixture)
  : allFixtures;
const buildOnly = process.argv.includes("--build-only");

function readCliValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

const packageSource = readCliValue("--package-source") ?? "packed";
const registryReleaseGroupId = readCliValue("--release-group");
const registryVersion = readCliValue("--version");
const registryDistTag = readCliValue("--dist-tag");
const registryMode = packageSource === "registry";

assert(
  packageSource === "packed" || packageSource === "registry",
  `Unsupported consumer package source ${packageSource}`,
);

let registryReleaseGroup = null;
let registryPackageMap = null;

if (registryMode) {
  assert(
    registryReleaseGroupId,
    "registry package source requires --release-group",
  );
  assert(registryVersion, "registry package source requires --version");
  assert(registryDistTag, "registry package source requires --dist-tag");

  const manifest = readReleaseGroups({ root: repositoryRoot });
  registryReleaseGroup = getReleaseGroup(registryReleaseGroupId, {
    root: repositoryRoot,
    manifest,
  });
  registryPackageMap = getReleasePackageMap(manifest);

  assert(
    registryVersion === registryReleaseGroup.version,
    `${registryReleaseGroupId} registry version mismatch`,
  );
  assert(
    registryDistTag === registryReleaseGroup.distTag,
    `${registryReleaseGroupId} registry dist-tag mismatch`,
  );
}

const matrixReportArgument = readCliValue("--matrix-report");
const traceDirectoryArgument = readCliValue("--trace-dir");
const accessibilityReportArgument = readCliValue("--accessibility-report");
const accessibilitySmoke = process.argv.includes("--accessibility-smoke");
const preserveBuiltFixtures = process.argv.includes(
  "--preserve-built-fixtures",
);
const matrixMode = Boolean(matrixReportArgument || traceDirectoryArgument);
const accessibilityMode = Boolean(
  accessibilityReportArgument || accessibilitySmoke,
);
const matrixResults = [];
const accessibilityResults = [];
let preserveGeneratedOutput = preserveBuiltFixtures;

assert(
  fixtures.length > 0,
  `Unknown consumer fixture ${String(requestedFixture)}`,
);
assert(
  !matrixMode || !requestedFixture,
  "Cross-framework matrix mode must run all consumer fixtures together.",
);
assert(
  !matrixMode || (matrixReportArgument && traceDirectoryArgument),
  "Cross-framework matrix mode requires both --matrix-report and --trace-dir.",
);
assert(
  !accessibilityReportArgument || !requestedFixture,
  "Cross-framework accessibility report mode must run all consumer fixtures together.",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
    },
    ...options,
  });
}

function runNpm(args, options = {}) {
  if (npmCliPath) {
    return run(process.execPath, [npmCliPath, ...args], options);
  }

  return run(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}

function removeFixtureOutput(fixtureDirectory) {
  for (const target of [
    "node_modules",
    "dist",
    "package-lock.json",
    ".vite",
    ".angular",
  ]) {
    rmSync(path.join(fixtureDirectory, target), {
      force: true,
      recursive: true,
    });
  }
}

function removeAllGeneratedOutput() {
  for (const fixture of fixtures) {
    removeFixtureOutput(path.join(repositoryRoot, fixture.directory));
  }
  rmSync(tempPackageDir, { force: true, recursive: true });
}

function packPackages() {
  mkdirSync(tempPackageDir, { recursive: true });

  return packageDefinitions.map((packageDefinition) => {
    const packageDirectory = path.join(
      repositoryRoot,
      packageDefinition.directory,
    );
    const output = runNpm(
      ["pack", "--pack-destination", tempPackageDir, "--json"],
      { cwd: packageDirectory },
    );
    const [packInfo] = JSON.parse(output);
    const tarballPath = path.join(tempPackageDir, packInfo.filename);
    assert(
      existsSync(tarballPath),
      `${packageDefinition.name}: tarball was not created`,
    );

    return {
      ...packageDefinition,
      filename: packInfo.filename,
      tarballPath,
    };
  });
}

function verifyInstalledPackages(fixtureDirectory, tarballs) {
  const fixtureRequire = createRequire(
    path.join(fixtureDirectory, "package.json"),
  );

  for (const packageInfo of tarballs) {
    const packagePath = path.join(
      fixtureDirectory,
      "node_modules",
      ...packageInfo.name.split("/"),
    );
    assert(
      existsSync(packagePath),
      `${packageInfo.name}: package is missing from ${fixtureDirectory}`,
    );
    assert(
      !lstatSync(packagePath).isSymbolicLink(),
      `${packageInfo.name}: clean consumer installation must not be a symlink`,
    );
    const resolvedRuntime = fixtureRequire.resolve(packageInfo.name);
    assert(
      resolvedRuntime.startsWith(packagePath),
      `${packageInfo.name}: runtime resolves outside the consumer installation`,
    );

    if (packageInfo.customElements) {
      const packageJson = JSON.parse(
        readFileSync(path.join(packagePath, "package.json"), "utf8"),
      );
      const manifestPath = path.join(packagePath, "custom-elements.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      assert(
        packageJson.customElements === "./custom-elements.json",
        "@vyrnforge/ui-elements installed package is missing customElements",
      );
      assert(
        packageJson.exports?.["./custom-elements.json"] ===
          "./custom-elements.json",
        "@vyrnforge/ui-elements installed package is missing manifest export",
      );
      assert(
        manifest.vyrnforge?.registeredTagCount === 58,
        "installed custom-elements.json must contain the 58-tag contract",
      );
      assert(
        fixtureRequire.resolve(
          "@vyrnforge/ui-elements/custom-elements.json",
        ) === manifestPath,
        "custom-elements.json must resolve through the public export",
      );
    }
  }
}

function registryDependencyClosure(releaseGroup, packageMap) {
  const packages = new Map();

  const visit = (packageName) => {
    if (packages.has(packageName)) return;

    const packageInfo = packageMap.get(packageName);
    assert(packageInfo, `release metadata is missing ${packageName}`);
    packages.set(packageName, packageInfo);

    for (const dependencyName of Object.keys(packageInfo.dependencies ?? {})) {
      if (packageMap.has(dependencyName)) visit(dependencyName);
    }
  };

  for (const packageInfo of releaseGroup.packages) {
    visit(packageInfo.name);
  }

  return packages;
}

function selectFixtureRegistryPackages(fixture) {
  const closure = registryDependencyClosure(
    registryReleaseGroup,
    registryPackageMap,
  );

  return fixture.packageNames.map((packageName) => {
    const packageInfo = closure.get(packageName);

    assert(
      packageInfo,
      `${fixture.id}: ${packageName} is not available in the selected registry release closure`,
    );

    return {
      ...packageInfo,
      customElements: packageName === "@vyrnforge/ui-elements",
      spec: `${packageName}@${packageInfo.version}`,
    };
  });
}

function selectFixtureTarballs(fixture, tarballs) {
  const packageNames = new Set(
    fixture.packedPackageNames ?? fixture.packageNames,
  );
  return tarballs.filter((tarball) => packageNames.has(tarball.name));
}

function verifyServerSafeImports(fixtureDirectory, fixture) {
  const packageNames = [...fixture.packageNames];
  if (packageNames.includes("@vyrnforge/ui-elements")) {
    packageNames.push("@vyrnforge/ui-elements/register");
  }

  const esmProbe = `
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.customElements;
    delete globalThis.HTMLElement;
    delete globalThis.ElementInternals;
    for (const packageName of ${JSON.stringify(packageNames)}) {
      await import(packageName);
    }
    if (globalThis.document !== undefined || globalThis.customElements !== undefined) {
      throw new Error("package import created DOM globals");
    }
    ${
      fixture.id === "react"
        ? `
      const React = await import("react");
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { Button } = await import("@vyrnforge/ui-components");
      const markup = renderToStaticMarkup(React.createElement(Button, { variant: "primary" }, "SSR"));
      if (!markup.includes("SSR")) throw new Error("React server render failed");
    `
        : ""
    }
  `;
  run(process.execPath, ["--input-type=module", "--eval", esmProbe], {
    cwd: fixtureDirectory,
  });

  const cjsProbe = `
    delete global.window;
    delete global.document;
    delete global.customElements;
    delete global.HTMLElement;
    delete global.ElementInternals;
    for (const packageName of ${JSON.stringify(packageNames)}) require(packageName);
    if (global.document !== undefined || global.customElements !== undefined) {
      throw new Error("package require created DOM globals");
    }
  `;
  run(process.execPath, ["--eval", cjsProbe], { cwd: fixtureDirectory });
  console.log(`SSR ${fixture.id}: ESM/CJS package imports passed.`);
}

function collectCssFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectCssFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".css") ? [entryPath] : [];
  });
}

function verifyBuiltCss(fixtureDirectory, fixture) {
  const outputDirectory = path.join(fixtureDirectory, fixture.outputDirectory);
  const cssFiles = collectCssFiles(outputDirectory);
  assert(cssFiles.length > 0, `${fixture.id} consumer build did not emit CSS`);
  const css = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert(
    css.includes("--vf-"),
    `${fixture.id} consumer CSS is missing VyrnForge tokens`,
  );
  assert(
    !css.includes("--udg-"),
    `${fixture.id} non-grid consumer CSS must not import data-grid tokens`,
  );
}

function npmSpawnArguments(args) {
  if (npmCliPath) {
    return {
      command: process.execPath,
      args: [npmCliPath, ...args],
    };
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
      // Retry while Vite starts.
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
  if (!processHandle) return;

  if (process.platform === "win32") {
    if (processHandle.exitCode !== null) return;
    try {
      execFileSync(
        "taskkill",
        ["/pid", String(processHandle.pid), "/T", "/F"],
        { stdio: "ignore" },
      );
    } catch {
      processHandle.kill();
    }
    await waitForProcessExit(processHandle, 5_000);
    return;
  }

  const signalProcessGroup = (signal) => {
    try {
      process.kill(-processHandle.pid, signal);
    } catch {
      try {
        processHandle.kill(signal);
      } catch {
        // The preview process already exited between checks.
      }
    }
  };

  signalProcessGroup("SIGTERM");
  if (
    processHandle.exitCode === null &&
    !(await waitForProcessExit(processHandle, 5_000))
  ) {
    signalProcessGroup("SIGKILL");
    await waitForProcessExit(processHandle, 5_000);
  }
}

async function waitForSharedMatrixStatus(page, expectedText) {
  await page.waitForFunction(
    ({ selector, expectedText: text }) =>
      document.querySelector(selector)?.textContent?.includes(text) === true,
    { selector: "[data-consumer-status]", expectedText },
  );
}

const matrixSelectors = Object.freeze({
  "native-html": {
    action: "#native-save > button[data-vf-action-control]",
    generatedButton: '#native-save[data-vf-generated-button="native"]',
    input: 'vf-text-input[name="owner"] input',
    actionText: "Action: save",
  },
  react: {
    action: "vf-button > button[data-vf-action-control]",
    generatedButton: 'vf-button[data-vf-generated-button="react"]',
    input: 'vf-text-input[name="owner"] input',
    actionText: "react-save",
  },
  angular: {
    action: "#angular-save > button[data-vf-action-control]",
    generatedButton: '#angular-save[data-vf-generated-button="angular"]',
    input: 'vf-text-input[name="owner"] input',
    actionText: "angular-save",
  },
  vue: {
    action: "#vue-save > button[data-vf-action-control]",
    generatedButton: '#vue-save[data-vf-generated-button="vue"]',
    input: 'vf-text-input[name="ownerPreview"] input',
    actionText: "vue-save",
  },
});

async function verifySharedMatrixScenario(page, fixture) {
  const selectors = matrixSelectors[fixture.id];
  assert(selectors, `Missing shared matrix selectors for ${fixture.id}`);

  await page.waitForSelector('[data-consumer-ready="true"]');

  const generatedButton = page.locator(selectors.generatedButton);
  await generatedButton.waitFor({ state: "visible" });
  assert(
    (await generatedButton.evaluate((element) => element.tagName)) ===
      "VF-BUTTON",
    `${fixture.id}: generated Button facade did not retain the canonical vf-button renderer`,
  );
  assert(
    ((await generatedButton.textContent()) ?? "").trim().length > 0,
    `${fixture.id}: generated Button default child/slot content is missing`,
  );

  const actionControl = page.locator(selectors.action);
  await actionControl.waitFor({ state: "visible" });
  await actionControl.click();
  await page.waitForSelector('[data-consumer-action="received"]');
  await page.waitForSelector('[data-generated-button-action="received"]');
  await waitForSharedMatrixStatus(page, selectors.actionText);

  const actionClassName = await actionControl.getAttribute("class");
  assert(
    actionClassName?.split(/\s+/u).includes("vf-button") === true &&
      actionClassName.split(/\s+/u).includes("vf-button--primary") === true,
    `${fixture.id}: generated Button did not preserve canonical primary styling`,
  );

  const statusText =
    (await page.locator("[data-consumer-status]").textContent()) ?? "";
  assert(
    statusText.includes(selectors.actionText),
    `${fixture.id}: canonical vf-action scenario diverged`,
  );

  assert(
    await page.getByRole("tab", { name: "Summary" }).isVisible(),
    `${fixture.id}: vf-tabs items property scenario diverged`,
  );

  const inputValue = await page.locator(selectors.input).inputValue();
  assert(
    inputValue === "Operations",
    `${fixture.id}: vf-text-input value property scenario diverged`,
  );

  return Object.freeze({
    consumer: fixture.id,
    scenarios: Object.freeze({
      "canonical-action-event": true,
      "generated-button-facade": true,
      "generated-button-styling": true,
      "tabs-property-assignment": true,
      "text-input-value-property": true,
    }),
  });
}

async function assertTabKeyboardState(page, fixtureId, expectedIndex, key) {
  try {
    await page.waitForFunction(
      (index) => {
        const tabs = [...document.querySelectorAll('[role="tab"]')];
        return (
          tabs.length > index &&
          document.activeElement === tabs[index] &&
          tabs[index]?.getAttribute("aria-selected") === "true"
        );
      },
      expectedIndex,
      { timeout: 3000 },
    );
  } catch (error) {
    const state = await page.evaluate(() => ({
      activeElement: {
        tag: document.activeElement?.tagName ?? null,
        role: document.activeElement?.getAttribute("role") ?? null,
        text: document.activeElement?.textContent?.trim() ?? null,
      },
      tabs: [...document.querySelectorAll('[role="tab"]')].map(
        (tab, index) => ({
          index,
          selected: tab.getAttribute("aria-selected"),
          tabIndex: tab.getAttribute("tabindex"),
          text: tab.textContent?.trim() ?? "",
        }),
      ),
    }));

    throw new Error(
      `${fixtureId}: ${key} did not preserve focus and selected state within 3 seconds: ${JSON.stringify(state)}`,
      { cause: error },
    );
  }
}

async function verifySharedAccessibilityScenario(page, fixture) {
  const selectors = matrixSelectors[fixture.id];
  assert(selectors, `Missing accessibility selectors for ${fixture.id}`);

  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    const result = await globalThis.axe.run(document, {
      resultTypes: ["violations"],
    });
    return {
      violations: result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        nodes: violation.nodes.length,
        targets: violation.nodes.slice(0, 5).map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      })),
    };
  });
  const blockers = axe.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact),
  );
  assert(
    blockers.length === 0,
    `${fixture.id}: Axe found serious/critical violations: ${blockers
      .map((violation) => {
        const targets = violation.targets
          .map((node) => node.target.join(" "))
          .join(", ");
        return `${violation.id} (${violation.impact}) [${targets}]`;
      })
      .join(", ")}`,
  );

  const action = page.locator(selectors.action);
  await action.focus();
  assert(
    await action.evaluate((element) => document.activeElement === element),
    `${fixture.id}: primary action did not receive keyboard focus`,
  );
  await action.press("Enter");
  await page.waitForSelector('[data-consumer-action="received"]');
  await waitForSharedMatrixStatus(page, selectors.actionText);

  const accessibilityTabs = page.getByRole("tab");
  const accessibilityTabCount = await accessibilityTabs.count();
  assert(
    accessibilityTabCount >= 2,
    `${fixture.id}: expected at least two tabs for keyboard navigation`,
  );

  const firstTab = accessibilityTabs.nth(0);
  const secondTab = accessibilityTabs.nth(1);

  await firstTab.focus();
  await firstTab.press("ArrowRight");
  await assertTabKeyboardState(page, fixture.id, 1, "ArrowRight");

  await secondTab.press("ArrowLeft");
  await assertTabKeyboardState(page, fixture.id, 0, "ArrowLeft");

  const input = page
    .getByRole("textbox", { name: "Owner", exact: true })
    .first();
  await input.waitFor({ state: "visible" });
  await input.focus();
  assert(
    await input.evaluate((element) => document.activeElement === element),
    `${fixture.id}: Owner input did not receive keyboard focus`,
  );

  return Object.freeze({
    consumer: fixture.id,
    axe: Object.freeze({
      violationCount: axe.violations.length,
      seriousOrCriticalCount: blockers.length,
      violations: axe.violations,
    }),
    scenarios: Object.freeze({
      "axe-serious-critical": true,
      "keyboard-action-activation": true,
      "keyboard-tabs-navigation": true,
      "text-input-accessible-name": true,
    }),
  });
}

async function verifyBrowserFixture(browser, fixture) {
  const fixtureDirectory = path.join(repositoryRoot, fixture.directory);
  const url = `http://127.0.0.1:${fixture.port}`;
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
  const server = spawn(preview.command, preview.args, {
    cwd: fixtureDirectory,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
  });

  let serverOutput = "";
  const browserDiagnostics = [];
  let context = null;
  server.stdout?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(url, server);
    context = await browser.newContext();
    if (matrixMode) {
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
    }
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        browserDiagnostics.push(`console.${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      browserDiagnostics.push(`pageerror: ${error.message}`);
    });

    await page.goto(url, { waitUntil: "networkidle" });

    if (accessibilityMode) {
      accessibilityResults.push(
        await verifySharedAccessibilityScenario(page, fixture),
      );
    }

    if (matrixMode) {
      matrixResults.push(await verifySharedMatrixScenario(page, fixture));
    }

    if (fixture.id === "native-html") {
      await page.waitForSelector('[data-consumer-ready="true"]');
      const saveControl = page.locator(
        "#native-save > button[data-vf-action-control]",
      );
      await saveControl.waitFor({ state: "visible" });
      await saveControl.click();
      await page.waitForSelector('[data-consumer-action="received"]');
      assert(
        (await page.locator("[data-consumer-status]").textContent())?.includes(
          "Action: save",
        ),
        "native HTML consumer did not receive vf-action",
      );
      assert(
        await page.getByRole("tab", { name: "Summary" }).isVisible(),
        "native HTML consumer did not render property-assigned tabs",
      );
      await page.locator('vf-text-input[name="owner"] input').fill("Platform");
      await page
        .locator(
          '#native-form vf-button[type="submit"] > button[data-vf-action-control]',
        )
        .click();
      await page.waitForSelector('[data-consumer-form="submitted"]');
      assert(
        (await page.locator("[data-consumer-status]").textContent())?.includes(
          "Platform",
        ),
        "native HTML consumer did not submit ElementInternals form data",
      );
      assert(
        await page.locator('[data-consumer-created="true"]').isVisible(),
        "typed document.createElement consumer evidence is missing",
      );
    } else if (fixture.id === "react") {
      await page.waitForSelector('[data-consumer-ready="true"]');
      const actionControl = page.locator(
        "vf-button > button[data-vf-action-control]",
      );
      await actionControl.waitFor({ state: "visible" });
      await actionControl.click();
      await page.waitForSelector('[data-consumer-action="received"]');
      await page.waitForFunction(() =>
        document
          .querySelector("[data-consumer-status]")
          ?.textContent?.includes("react-save"),
      );
      assert(
        (await page.locator("[data-consumer-status]").textContent())?.includes(
          "react-save",
        ),
        "React consumer did not render the vf-action state update",
      );
      assert(
        await page.getByRole("tab", { name: "Summary" }).isVisible(),
        "React did not assign the vf-tabs items property",
      );
      assert(
        (await page
          .locator('vf-text-input[name="owner"] input')
          .inputValue()) === "Operations",
        "React did not assign the vf-text-input value property",
      );
    } else if (fixture.id === "angular") {
      await page.waitForSelector('[data-consumer-ready="true"]');
      await page.waitForSelector('[data-consumer-property="verified"]');
      const actionControl = page.locator(
        "#angular-save > button[data-vf-action-control]",
      );
      await actionControl.waitFor({ state: "visible" });
      await actionControl.click();
      await page.waitForSelector('[data-consumer-action="received"]');
      await page.waitForFunction(() =>
        document
          .querySelector("[data-consumer-status]")
          ?.textContent?.includes("angular-save"),
      );
      assert(
        (await page.locator("[data-consumer-status]").textContent())?.includes(
          "angular-save",
        ),
        "Angular consumer did not render the vf-action state update",
      );
      assert(
        await page.getByRole("tab", { name: "Summary" }).isVisible(),
        "Angular did not assign the vf-tabs items property",
      );
      assert(
        (await page
          .locator('vf-text-input[name="owner"] input')
          .inputValue()) === "Operations",
        "Angular did not assign the vf-text-input value property",
      );
      assert(
        await page
          .locator('.vf-page-header__status [data-angular-slot="status"]')
          .isVisible(),
        "Angular named status slot did not compose in Light DOM",
      );
      assert(
        await page
          .locator(".vf-page-header__actions #angular-save")
          .isVisible(),
        "Angular named actions slot did not compose in Light DOM",
      );

      const reactiveOwner = page.locator('vf-text-input[name="reactiveOwner"]');
      const reactiveOwnerInput = reactiveOwner.locator("input");
      assert(
        (await reactiveOwnerInput.inputValue()) === "Operations",
        "Angular reactive FormControl did not write its initial value",
      );
      assert(
        (await page.locator("[data-reactive-value]").textContent())?.includes(
          "Operations",
        ),
        "Angular reactive form model did not expose its initial value",
      );

      await reactiveOwnerInput.fill("Platform Forms");
      await page.waitForFunction(() =>
        document
          .querySelector("[data-reactive-value]")
          ?.textContent?.includes("Platform Forms"),
      );
      await page.waitForFunction(() =>
        document
          .querySelector("[data-reactive-state]")
          ?.textContent?.includes("dirty=true"),
      );

      await page
        .locator("#disable-reactive-owner > button[data-vf-action-control]")
        .click();
      await page.waitForFunction(() => {
        const element = document.querySelector(
          'vf-text-input[name="reactiveOwner"]',
        );
        const state = document.querySelector("[data-reactive-state]");
        return (
          element?.disabled === true &&
          state?.textContent?.includes("touched=true") === true &&
          state.textContent.includes("disabled=true")
        );
      });

      await page
        .locator("#enable-reactive-owner > button[data-vf-action-control]")
        .click();
      await page.waitForFunction(() => {
        const element = document.querySelector(
          'vf-text-input[name="reactiveOwner"]',
        );
        return element?.disabled === false;
      });

      await reactiveOwnerInput.fill("");
      await page.waitForFunction(() =>
        document
          .querySelector("[data-reactive-state]")
          ?.textContent?.includes("vyrnForgeError=true"),
      );
      assert(
        await reactiveOwner.evaluate((element) =>
          typeof element.checkValidity === "function"
            ? !element.checkValidity()
            : false,
        ),
        "Angular reactive adapter did not expose native invalid state",
      );

      await reactiveOwnerInput.fill("Validated Owner");
      await page.waitForFunction(() => {
        const value = document.querySelector("[data-reactive-value]");
        const state = document.querySelector("[data-reactive-state]");
        return (
          value?.textContent?.includes("Validated Owner") === true &&
          state?.textContent?.includes("status=VALID") === true &&
          state.textContent.includes("vyrnForgeError=false")
        );
      });

      const notifications = page.locator('vf-checkbox[name="notifications"]');
      const notificationsInput = notifications.locator(
        "input[data-vf-choice-control]",
      );
      assert(
        await notificationsInput.isChecked(),
        "Angular ngModel did not write the initial checked value",
      );
      await notificationsInput.click();
      await page.waitForFunction(() =>
        document
          .querySelector("[data-template-value]")
          ?.textContent?.includes("false"),
      );
      assert(
        (await notifications.evaluate((element) => element.checked)) === false,
        "Angular ngModel did not receive vf-checked-change",
      );

      assert(
        await page
          .locator('vf-text-input[name="owner"]')
          .evaluate((element) =>
            typeof element.checkValidity === "function"
              ? element.checkValidity()
              : false,
          ),
        "Angular native form control did not expose valid ElementInternals state",
      );
      await page.locator('vf-text-input[name="owner"] input').fill("Platform");
      await page
        .locator(
          '#angular-form vf-button[type="submit"] > button[data-vf-action-control]',
        )
        .click();
      await page.waitForSelector('[data-consumer-form="submitted"]');
      await page.waitForFunction(() =>
        document
          .querySelector("[data-consumer-status]")
          ?.textContent?.includes("Platform"),
      );
      assert(
        (await page.locator("[data-consumer-status]").textContent())?.includes(
          "Platform",
        ),
        "Angular consumer did not submit ElementInternals form data",
      );
    } else if (fixture.id === "vue") {
      await page.waitForSelector('[data-consumer-ready="true"]');
      await page.waitForSelector('[data-consumer-property="verified"]');
      const actionControl = page.locator(
        "#vue-save > button[data-vf-action-control]",
      );
      await actionControl.waitFor({ state: "visible" });
      await actionControl.click();
      await page.waitForSelector('[data-consumer-action="received"]');
      await page.waitForFunction(() =>
        document
          .querySelector("[data-consumer-status]")
          ?.textContent?.includes("vue-save"),
      );
      assert(
        (await page.locator("[data-consumer-status]").textContent())?.includes(
          "vue-save",
        ),
        "Vue consumer did not render the vf-action state update",
      );
      assert(
        await page.getByRole("tab", { name: "Summary" }).isVisible(),
        "Vue did not assign the vf-tabs items property",
      );
      assert(
        (await page
          .locator('vf-text-input[name="ownerPreview"] input')
          .inputValue()) === "Operations",
        "Vue did not assign the vf-text-input value property",
      );
      assert(
        await page
          .locator('.vf-page-header__status [data-vue-slot="status"]')
          .isVisible(),
        "Vue named status slot did not compose in Light DOM",
      );
      assert(
        await page.locator(".vf-page-header__actions #vue-save").isVisible(),
        "Vue named actions slot did not compose in Light DOM",
      );

      await page
        .locator('vf-text-input[name="ownerPreview"] input')
        .fill("Vue Platform");
      await page.waitForSelector('[data-consumer-value="received"]');
      await page.waitForFunction(() =>
        document
          .querySelector("[data-vue-value]")
          ?.textContent?.includes("Vue Platform"),
      );
      assert(
        (await page.locator("[data-vue-value]").textContent())?.includes(
          "Vue Platform",
        ),
        "Vue consumer did not receive vf-value-change",
      );

      const modelOwner = page.locator("#vue-model-owner input");
      assert(
        (await modelOwner.inputValue()) === "Model Operations",
        "Vue v-model adapter did not write the initial value property",
      );
      await modelOwner.fill("Model Platform");
      await page.waitForFunction(() =>
        document
          .querySelector("[data-vue-model-value]")
          ?.textContent?.includes("Model Platform"),
      );

      const modelNotifications = page.locator(
        "#vue-model-notifications input[data-vf-choice-control]",
      );
      assert(
        await modelNotifications.isChecked(),
        "Vue v-model adapter did not write the initial checked property",
      );
      await modelNotifications.click();
      await page.waitForFunction(() =>
        document
          .querySelector("[data-vue-model-checked]")
          ?.textContent?.includes("false"),
      );

      await page
        .locator("#vue-model-programmatic > button[data-vf-action-control]")
        .click();
      await page.waitForSelector('[data-vue-model-programmatic="applied"]');
      await page.waitForFunction(() => {
        const owner = document.querySelector("#vue-model-owner");
        const checkbox = document.querySelector("#vue-model-notifications");
        return (
          owner?.value === "Programmatic Vue" && checkbox?.checked === true
        );
      });
      assert(
        (await modelOwner.inputValue()) === "Programmatic Vue" &&
          (await modelNotifications.isChecked()),
        "Vue model state did not propagate back to native value and checked properties",
      );

      assert(
        await page
          .locator('vf-text-input[name="owner"]')
          .evaluate((element) =>
            typeof element.checkValidity === "function"
              ? element.checkValidity()
              : false,
          ),
        "Vue native form control did not expose valid ElementInternals state",
      );
      await page.locator('vf-text-input[name="owner"] input').fill("Vue Forms");
      await page
        .locator(
          '#vue-form vf-button[type="submit"] > button[data-vf-action-control]',
        )
        .click();
      await page.waitForSelector('[data-consumer-form="submitted"]');
      await page.waitForFunction(() =>
        document
          .querySelector("[data-consumer-status]")
          ?.textContent?.includes("Vue Forms"),
      );
      assert(
        (await page.locator("[data-consumer-status]").textContent())?.includes(
          "Vue Forms",
        ),
        "Vue consumer did not submit ElementInternals form data",
      );
    } else {
      throw new Error(`Unhandled consumer fixture ${fixture.id}`);
    }

    await page.close();
    if (matrixMode) {
      const traceDirectory = path.resolve(
        repositoryRoot,
        traceDirectoryArgument,
      );
      mkdirSync(traceDirectory, { recursive: true });
      await context.tracing.stop({
        path: path.join(traceDirectory, `${fixture.id}.zip`),
      });
    }
    await context.close();
    console.log(
      `RUNTIME ${fixture.id}: packed build and browser smoke passed.`,
    );
  } catch (error) {
    const diagnostics =
      browserDiagnostics.length > 0 ? `\n${browserDiagnostics.join("\n")}` : "";
    throw new Error(
      `${fixture.id} browser verification failed: ${error.message}\n${serverOutput}${diagnostics}`,
    );
  } finally {
    if (context) {
      try {
        if (matrixMode) {
          const traceDirectory = path.resolve(
            repositoryRoot,
            traceDirectoryArgument,
          );
          mkdirSync(traceDirectory, { recursive: true });
          const tracePath = path.join(traceDirectory, `${fixture.id}.zip`);
          if (!existsSync(tracePath)) {
            await context.tracing.stop({ path: tracePath });
          }
        }
        await context.close();
      } catch {
        // Preserve the original browser verification error.
      }
    }
    console.log(`RUNTIME ${fixture.id}: stopping preview process tree...`);
    await stopProcess(server);
    server.stdout?.destroy();
    server.stderr?.destroy();
    console.log(`RUNTIME ${fixture.id}: preview process tree stopped.`);
  }
}

try {
  removeAllGeneratedOutput();

  let tarballs = [];

  if (!registryMode) {
    console.log("Building the framework-neutral packages...");
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-core"], {
      stdio: "inherit",
    });
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-behaviors"], {
      stdio: "inherit",
    });
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-components"], {
      stdio: "inherit",
    });
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-elements"], {
      stdio: "inherit",
    });
    runNpm(["run", "build", "--workspace", "@vyrnforge/ui-angular"], {
      stdio: "inherit",
    });

    console.log(
      "Packing ui-core, ui-behaviors, ui-components, ui-elements, and ui-angular...",
    );
    tarballs = packPackages();
  } else {
    console.log(
      `Using exact registry packages for ${registryReleaseGroupId} ${registryVersion}.`,
    );
  }

  for (const fixture of fixtures) {
    const fixtureDirectory = path.join(repositoryRoot, fixture.directory);
    console.log(`Installing clean dependencies for ${fixture.id}...`);
    runNpm(["install", "--no-package-lock"], {
      cwd: fixtureDirectory,
      stdio: "inherit",
    });
    if (registryMode) {
      const registryPackages = selectFixtureRegistryPackages(fixture);

      runNpm(
        [
          "install",
          "--no-package-lock",
          "--no-save",
          "--ignore-scripts",
          "--registry=https://registry.npmjs.org",
          ...registryPackages.map(({ spec }) => spec),
        ],
        {
          cwd: fixtureDirectory,
          stdio: "inherit",
        },
      );

      verifyInstalledPackages(fixtureDirectory, registryPackages);
    } else {
      const fixtureTarballs = selectFixtureTarballs(fixture, tarballs);

      runNpm(
        [
          "install",
          "--no-package-lock",
          "--no-save",
          ...fixtureTarballs.map((tarball) => tarball.tarballPath),
        ],
        {
          cwd: fixtureDirectory,
          stdio: "inherit",
        },
      );

      verifyInstalledPackages(fixtureDirectory, fixtureTarballs);
    }
    verifyServerSafeImports(fixtureDirectory, fixture);
    runNpm(["run", "typecheck"], {
      cwd: fixtureDirectory,
      stdio: "inherit",
    });
    runNpm(["run", "build"], {
      cwd: fixtureDirectory,
      stdio: "inherit",
    });
    verifyBuiltCss(fixtureDirectory, fixture);
  }

  if (!buildOnly) {
    const browserName = process.env.VYRNFORGE_BROWSER ?? "chromium";
    const browserType = { chromium, firefox, webkit }[browserName];
    assert(browserType, `Unsupported browser ${browserName}`);
    const browser = await browserType.launch({
      executablePath:
        browserName === "chromium"
          ? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined
          : undefined,
    });
    try {
      for (const fixture of fixtures) {
        await verifyBrowserFixture(browser, fixture);
      }
    } finally {
      await browser.close();
    }
  }

  if (matrixMode) {
    const expectedScenarioIds = [
      "canonical-action-event",
      "generated-button-facade",
      "generated-button-styling",
      "tabs-property-assignment",
      "text-input-value-property",
    ];
    assert(
      matrixResults.length === allFixtures.length,
      "Cross-framework matrix did not record every consumer.",
    );
    for (const scenarioId of expectedScenarioIds) {
      assert(
        matrixResults.every((result) => result.scenarios[scenarioId] === true),
        `Cross-framework matrix diverged for ${scenarioId}`,
      );
    }

    const reportPath = path.resolve(repositoryRoot, matrixReportArgument);
    mkdirSync(path.dirname(reportPath), { recursive: true });
    writeFileSync(
      reportPath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          task: "CF-7009",
          status: "passed",
          consumers: matrixResults,
          scenarios: expectedScenarioIds,
        },
        null,
        2,
      )}
`,
      "utf8",
    );
    console.log(
      `Cross-framework matrix report written to ${path.relative(
        repositoryRoot,
        reportPath,
      )}.`,
    );
  }

  if (accessibilityReportArgument) {
    const expectedAccessibilityScenarioIds = [
      "axe-serious-critical",
      "keyboard-action-activation",
      "keyboard-tabs-navigation",
      "text-input-accessible-name",
    ];
    assert(
      accessibilityResults.length === allFixtures.length,
      "Cross-framework accessibility review did not record every consumer.",
    );
    for (const scenarioId of expectedAccessibilityScenarioIds) {
      assert(
        accessibilityResults.every(
          (result) => result.scenarios[scenarioId] === true,
        ),
        `Cross-framework accessibility review diverged for ${scenarioId}`,
      );
    }

    const accessibilityReportPath = path.resolve(
      repositoryRoot,
      accessibilityReportArgument,
    );
    mkdirSync(path.dirname(accessibilityReportPath), { recursive: true });
    writeFileSync(
      accessibilityReportPath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          task: "CF-7010",
          status: "automated-passed",
          consumers: accessibilityResults,
          scenarios: expectedAccessibilityScenarioIds,
          manualReviewRequired: true,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    console.log(
      `Cross-framework accessibility report written to ${path.relative(
        repositoryRoot,
        accessibilityReportPath,
      )}.`,
    );
  }

  preserveGeneratedOutput = preserveBuiltFixtures;
  console.log(
    `${buildOnly ? "Consumer build/SSR matrix" : "Consumer runtime"} passed for ${fixtures
      .map((fixture) => fixture.id)
      .join(", ")}.`,
  );
} finally {
  if (preserveGeneratedOutput) {
    console.log(
      "Packed consumer build output was preserved for the manual accessibility review.",
    );
  } else {
    removeAllGeneratedOutput();
  }
}
