import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const npmCliPath = process.env.npm_execpath;
const tempPackageDir = path.join(
  repositoryRoot,
  "tests/consumers/.tmp-packages",
);

const packageDefinitions = [
  { name: "@vyrnforge/ui-core", directory: "packages/ui-core" },
  { name: "@vyrnforge/ui-behaviors", directory: "packages/ui-behaviors" },
  {
    name: "@vyrnforge/ui-elements",
    directory: "packages/ui-elements",
    customElements: true,
  },
];

const allFixtures = [
  {
    id: "native-html",
    directory: "tests/consumers/native-html",
    outputDirectory: "dist",
    port: 4181,
  },
  {
    id: "react",
    directory: "tests/consumers/react",
    outputDirectory: "dist",
    port: 4182,
  },
  {
    id: "angular",
    directory: "tests/consumers/angular",
    outputDirectory: "dist/vyrnforge-angular-consumer-fixture/browser",
    port: 4183,
  },
  {
    id: "vue",
    directory: "tests/consumers/vue",
    outputDirectory: "dist",
    port: 4184,
  },
];

const fixtureArgumentIndex = process.argv.indexOf("--fixture");
const requestedFixture =
  fixtureArgumentIndex >= 0 ? process.argv[fixtureArgumentIndex + 1] : null;
const fixtures = requestedFixture
  ? allFixtures.filter((fixture) => fixture.id === requestedFixture)
  : allFixtures;

assert(
  fixtures.length > 0,
  `Unknown consumer fixture ${String(requestedFixture)}`,
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

function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  if (process.platform === "win32") {
    try {
      execFileSync(
        "taskkill",
        ["/pid", String(processHandle.pid), "/T", "/F"],
        { stdio: "ignore" },
      );
    } catch {
      processHandle.kill();
    }
  } else {
    processHandle.kill("SIGTERM");
  }
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
  });

  let serverOutput = "";
  const browserDiagnostics = [];
  server.stdout?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr?.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(url, server);
    const page = await browser.newPage();
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        browserDiagnostics.push(`console.${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      browserDiagnostics.push(`pageerror: ${error.message}`);
    });

    await page.goto(url, { waitUntil: "networkidle" });

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
        (await page.locator("vf-text-input input").inputValue()) ===
          "Operations",
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
    console.log(`RUNTIME ${fixture.id}: packed build and Chromium passed.`);
  } catch (error) {
    const diagnostics =
      browserDiagnostics.length > 0 ? `\n${browserDiagnostics.join("\n")}` : "";
    throw new Error(
      `${fixture.id} browser verification failed: ${error.message}\n${serverOutput}${diagnostics}`,
    );
  } finally {
    stopProcess(server);
  }
}

try {
  removeAllGeneratedOutput();

  console.log("Building the framework-neutral packages...");
  runNpm(["run", "build", "--workspace", "@vyrnforge/ui-core"], {
    stdio: "inherit",
  });
  runNpm(["run", "build", "--workspace", "@vyrnforge/ui-behaviors"], {
    stdio: "inherit",
  });
  runNpm(["run", "build", "--workspace", "@vyrnforge/ui-elements"], {
    stdio: "inherit",
  });

  console.log("Packing ui-core, ui-behaviors, and ui-elements...");
  const tarballs = packPackages();

  for (const fixture of fixtures) {
    const fixtureDirectory = path.join(repositoryRoot, fixture.directory);
    console.log(`Installing clean dependencies for ${fixture.id}...`);
    runNpm(["install", "--no-package-lock"], {
      cwd: fixtureDirectory,
      stdio: "inherit",
    });
    runNpm(
      [
        "install",
        "--no-package-lock",
        "--no-save",
        ...tarballs.map((tarball) => tarball.tarballPath),
      ],
      {
        cwd: fixtureDirectory,
        stdio: "inherit",
      },
    );
    verifyInstalledPackages(fixtureDirectory, tarballs);
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

  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
  try {
    for (const fixture of fixtures) {
      await verifyBrowserFixture(browser, fixture);
    }
  } finally {
    await browser.close();
  }

  console.log(
    `Consumer runtime passed for ${fixtures.map((fixture) => fixture.id).join(", ")}.`,
  );
} finally {
  removeAllGeneratedOutput();
}
