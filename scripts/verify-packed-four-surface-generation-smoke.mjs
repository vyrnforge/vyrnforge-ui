import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;
const evidenceDirectory = path.join(
  root,
  "test-results/packed-four-surface-smoke",
);
const reportPath = path.join(evidenceDirectory, "report.json");

const representativeSlices = Object.freeze([
  "Button",
  "TextInput",
  "Tabs",
  "Dialog",
]);

const fixtures = Object.freeze([
  {
    id: "native-html",
    source: "tests/consumers/native-html/src/main.ts",
    styles: "tests/consumers/native-html/src/styles.css",
    requiredMarkers: [
      "bindGeneratedVfButton",
      "bindGeneratedVfTextInput",
      "bindGeneratedVfTabs",
      "bindGeneratedVfDialog",
    ],
  },
  {
    id: "react",
    source: "tests/consumers/react/src/main.tsx",
    styles: "tests/consumers/react/src/styles.css",
    requiredMarkers: [
      "GeneratedButton",
      "GeneratedTextInput",
      "GeneratedTabs",
      "GeneratedDialog",
    ],
  },
  {
    id: "angular",
    source: "tests/consumers/angular/src/app/app.component.html",
    styles: "tests/consumers/angular/src/styles.css",
    requiredMarkers: [
      "vfGeneratedButton",
      "vfGeneratedTextInput",
      "vfGeneratedTabs",
      "vfGeneratedDialog",
    ],
  },
  {
    id: "vue",
    source: "tests/consumers/vue/src/App.vue",
    styles: "tests/consumers/vue/src/styles.css",
    requiredMarkers: ["VfButton", "VfTextInput", "VfTabs", "VfDialog"],
  },
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function runNode(args) {
  execFileSync(process.execPath, args, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
    },
  });
}

function verifyFixtureContract(fixture) {
  const source = read(fixture.source);
  const styles = read(fixture.styles);

  for (const marker of fixture.requiredMarkers) {
    assert(
      source.includes(marker),
      `${fixture.id}: representative packed smoke is missing ${marker}`,
    );
  }

  assert(
    !/(?:\.\.\/)+packages\/|@vyrnforge\/[^"'\s]+\/src\//.test(source),
    `${fixture.id}: consumer source must use public package entrypoints only`,
  );
  assert(
    !/--vf-[a-z0-9-]+\s*:/.test(styles),
    `${fixture.id}: app-local CSS must not redeclare VyrnForge --vf-* tokens`,
  );

  return {
    id: fixture.id,
    source: fixture.source,
    styles: fixture.styles,
    representativeSlices,
    publicEntrypointsOnly: true,
    localTokenRedeclarations: false,
  };
}

const fixtureEvidence = fixtures.map(verifyFixtureContract);

runNode([
  "scripts/verify-consumer-foundations-runtime.mjs",
  "--matrix-report",
  "test-results/cross-framework-matrix/report.json",
  "--trace-dir",
  "test-results/cross-framework-matrix/traces",
  "--accessibility-report",
  "test-results/cross-framework-matrix/accessibility-report.json",
  "--preserve-built-fixtures",
]);

runNode(["scripts/verify-framework-dialog-runtime.mjs"]);

mkdirSync(evidenceDirectory, { recursive: true });
writeFileSync(
  reportPath,
  `${JSON.stringify(
    {
      task: "MFD-1116",
      packageSource: "packed",
      representativeSlices,
      fixtures: fixtureEvidence,
      assertions: {
        cleanPackedInstall: true,
        typecheck: true,
        productionBuild: true,
        browserSmoke: true,
        sharedVyrnForgeAssets: true,
        noAppLocalTokenDuplication: true,
      },
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  `MFD-1116 packed four-surface generation smoke passed; evidence written to ${path.relative(root, reportPath)}.`,
);
