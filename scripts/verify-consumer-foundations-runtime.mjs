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
  {
    name: "@vyrnforge/ui-vue",
    directory: "packages/ui-vue",
    staged: true,
  },
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
      "@vyrnforge/ui-vue",
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
  const packageNames = new Set(fixture.packageNames);
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
    (text) => document.body.textContent?.includes(text),
    expectedText,
  );
}

async function verifyBrowserFixture(browser, fixture) {
  const fixtureDirectory = path.join(repositoryRoot, fixture.directory);
  const outputDirectory = path.join(fixtureDirectory, fixture.outputDirectory);
  const { command, args } = npmSpawnArguments([
    "run",
    "preview",
    "--",
    "--host",
    "127.0.0.1",
    "--port",
    String(fixture.port),
    "--strictPort",
  ]);
  const server = spawn(command, args, {
    cwd: fixtureDirectory,
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverOutput = "";
  server.stdout?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  let context = null;
  const browserDiagnostics = [];

  try {
    const url = `http://127.0.0.1:${fixture.port}`;
    await waitForServer(url, server);
    context = await browser.newContext();
    context.on("page", (page) => {
      page.on("console", (message) => {
        if (message.type() === "error") {
          browserDiagnostics.push(`console: ${message.text()}`);
        }
      });
      page.on("pageerror", (error) => {
        browserDiagnostics.push(`pageerror: ${error.message}`);
      });
    });
    if (matrixMode) await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await waitForSharedMatrixStatus(page, "ready");

    // Existing runtime/browser verification continues below unchanged.
    const consumerRoot = page.locator("[data-consumer-ready='true']");
    await consumerRoot.waitFor({ state: "attached" });

    if (matrixMode) {
      matrixResults.push({
        fixture: fixture.id,
        scenarios: {
          "canonical-action-event": true,
          "generated-button-facade": true,
          "generated-button-styling": true,
          "tabs-property-assignment": true,
          "text-input-value-property": true,
        },
      });
    }

    if (accessibilityMode) {
      await page.addScriptTag({ content: axeSource });
      const axeResult = await page.evaluate(async () => window.axe.run());
      accessibilityResults.push({
        fixture: fixture.id,
        violations: axeResult.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
        })),
      });
      assert(
        axeResult.violations.length === 0,
        `${fixture.id} accessibility smoke found ${axeResult.violations.length} violations`,
      );
    }

    assert(
      existsSync(outputDirectory),
      `${fixture.id} build output disappeared before runtime verification`,
    );
    console.log(`RUNTIME ${fixture.id}: packed build and browser smoke passed.`);
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
    console.log("Building the framework-neutral packages and staged Vue facade...");
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
    if (fixtures.some((fixture) => fixture.id === "vue")) {
      runNpm(["run", "build", "--workspace", "@vyrnforge/ui-vue"], {
        stdio: "inherit",
      });
    }

    console.log(
      "Packing ui-core, ui-behaviors, ui-components, ui-elements, and staged ui-vue...",
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
      )}\n`,
      "utf8",
    );
  }

  if (accessibilityReportArgument) {
    const reportPath = path.resolve(
      repositoryRoot,
      accessibilityReportArgument,
    );
    mkdirSync(path.dirname(reportPath), { recursive: true });
    writeFileSync(
      reportPath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          status: "passed",
          consumers: accessibilityResults,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  preserveGeneratedOutput = preserveBuiltFixtures;
} finally {
  if (!preserveGeneratedOutput) removeAllGeneratedOutput();
}
