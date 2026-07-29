import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedTasks = new Map([
  ["CF-7001", 3],
  ["CF-7002", 3],
  ["CF-7008", 5],
]);

const allowedFixtureClaims = new Map([
  ["native-html", new Set(["packed-runtime-verified"])],
  ["react", new Set(["packed-custom-elements-runtime-verified"])],
  [
    "angular",
    new Set(["architecture-fixture-only", "packed-angular-runtime-verified"]),
  ],
  ["vue", new Set(["architecture-fixture-only"])],
]);

const allowedBetaClaims = new Map([
  ["native-html", new Set(["packed-consumer-verified"])],
  ["react", new Set(["custom-elements-consumer-verified"])],
  ["angular", new Set(["planned", "packed-consumer-verified"])],
  ["vue", new Set(["planned"])],
]);

const requiredDocuments = [
  "docs/metadata/consumer-foundations.json",
  "docs/testing/consumer-foundation-contracts.md",
  "docs/testing/multi-framework-consumer-fixtures.md",
  "packages/ui-elements/custom-elements.json",
  "packages/ui-elements/src/custom-elements.ts",
  "tests/consumers/native-html/package.json",
  "tests/consumers/native-html/src/main.ts",
  "tests/consumers/react/package.json",
  "tests/consumers/react/src/main.tsx",
  "tests/consumers/react/src/vyrnforge-elements.d.ts",
  "scripts/generate-ui-elements-manifest.mjs",
  "scripts/verify-consumer-foundations-runtime.mjs",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function addFailure(failures, message) {
  failures.push(message);
}

function collectCanonicalEventNames(text) {
  const detailMap = text.match(
    /export interface VyrnForgeCanonicalEventDetailMap\s*\{([\s\S]*?)\n\}/,
  );
  return detailMap
    ? [...detailMap[1].matchAll(/readonly\s+"([^"]+)"\s*:/g)].map(
        (match) => match[1],
      )
    : [];
}

function collectRegistryDefinitions(text) {
  return [
    ...text.matchAll(
      /tagName:\s*"([^"]+)"\s*,\s*constructor:\s*([A-Za-z0-9_]+)/gs,
    ),
  ].map((match) => ({ tagName: match[1], className: match[2] }));
}

function verifyTasks(root, failures, closure) {
  if (closure.program?.sprint !== "S7") {
    addFailure(failures, "consumer foundation sprint must be S7");
  }
  if (closure.program?.batch !== "CF-7001-CF-7002-CF-7008") {
    addFailure(failures, "consumer foundation batch is invalid");
  }
  if (closure.program?.status !== "evidence-complete") {
    addFailure(
      failures,
      "consumer foundation status must be evidence-complete",
    );
  }
  if (closure.program?.gate !== "GMF4") {
    addFailure(failures, "consumer foundation gate must be GMF4");
  }
  if (closure.program?.gateStatus !== "in-progress") {
    addFailure(failures, "GMF4 must remain in-progress");
  }

  const tasks = new Map((closure.tasks ?? []).map((task) => [task.id, task]));
  for (const [taskId, storyPoints] of expectedTasks) {
    const task = tasks.get(taskId);
    if (!task) {
      addFailure(failures, `consumer foundation is missing ${taskId}`);
      continue;
    }
    if (task.status !== "done") {
      addFailure(failures, `${taskId} must be done`);
    }
    if (task.storyPoints !== storyPoints) {
      addFailure(failures, `${taskId} story points must be ${storyPoints}`);
    }
    if (!task.evidence || !existsSync(path.join(root, task.evidence))) {
      addFailure(failures, `${taskId} evidence is missing`);
    }
  }
  if (tasks.size !== expectedTasks.size) {
    addFailure(
      failures,
      `consumer foundation must contain exactly ${expectedTasks.size} tasks`,
    );
  }
}

function verifyPackageContract(root, failures, closure) {
  const packageJson = readJson(root, "packages/ui-elements/package.json");
  const rootPackageJson = readJson(root, "package.json");
  const registryText = read(root, "packages/ui-elements/src/registry.ts");
  const eventsText = read(root, "packages/ui-elements/src/events.ts");
  const typeMapText = read(root, "packages/ui-elements/src/custom-elements.ts");
  const baseText = read(
    root,
    "packages/ui-elements/src/base/VyrnForgeElement.ts",
  );
  const manifest = readJson(root, "packages/ui-elements/custom-elements.json");
  const definitions = collectRegistryDefinitions(registryText);
  const declarations =
    manifest.modules?.flatMap((module) => module.declarations ?? []) ?? [];

  if (definitions.length !== 58) {
    addFailure(
      failures,
      `consumer foundation expected 58 registry tags, received ${definitions.length}`,
    );
  }
  if (declarations.length !== definitions.length) {
    addFailure(
      failures,
      "custom-elements.json declaration count must match the registry",
    );
  }

  const declarationMap = new Map(
    declarations.map((declaration) => [declaration.tagName, declaration]),
  );
  for (const definition of definitions) {
    const declaration = declarationMap.get(definition.tagName);
    if (!declaration) {
      addFailure(
        failures,
        `custom-elements.json is missing ${definition.tagName}`,
      );
      continue;
    }
    if (
      declaration.name !== definition.className ||
      declaration.customElement !== true
    ) {
      addFailure(
        failures,
        `${definition.tagName} manifest declaration is inconsistent`,
      );
    }
    if (
      !typeMapText.includes(`"${definition.tagName}"`) ||
      !typeMapText.includes(`"${definition.className}"`)
    ) {
      addFailure(
        failures,
        `typed HTMLElementTagNameMap is missing ${definition.tagName}`,
      );
    }
  }

  if (manifest.schemaVersion !== "1.0.0") {
    addFailure(failures, "custom-elements.json schemaVersion must be 1.0.0");
  }
  if (manifest.vyrnforge?.registeredTagCount !== 58) {
    addFailure(failures, "custom-elements.json must record 58 tags");
  }

  const canonicalEventNames = collectCanonicalEventNames(eventsText);
  if (canonicalEventNames.length === 0) {
    addFailure(failures, "canonical event detail map is missing or empty");
  } else if (
    JSON.stringify(manifest.vyrnforge?.eventVocabulary ?? []) !==
    JSON.stringify(canonicalEventNames)
  ) {
    addFailure(
      failures,
      "custom-elements.json event vocabulary must match the canonical event detail map",
    );
  }
  if (
    manifest.vyrnforge?.typeDeclarations?.tagNameMap !==
    "VyrnForgeHTMLElementTagNameMap"
  ) {
    addFailure(failures, "custom-elements.json tag map contract is missing");
  }

  if (packageJson.customElements !== "./custom-elements.json") {
    addFailure(
      failures,
      "@vyrnforge/ui-elements must expose the customElements package field",
    );
  }
  if (
    packageJson.exports?.["./custom-elements.json"] !== "./custom-elements.json"
  ) {
    addFailure(
      failures,
      "@vyrnforge/ui-elements must export custom-elements.json",
    );
  }
  if (!(packageJson.files ?? []).includes("custom-elements.json")) {
    addFailure(
      failures,
      "@vyrnforge/ui-elements package files must include custom-elements.json",
    );
  }
  if (
    (packageJson.dependencies ?? {}).react ||
    (packageJson.peerDependencies ?? {}).react
  ) {
    addFailure(
      failures,
      "@vyrnforge/ui-elements must not acquire a React dependency",
    );
  }

  for (const marker of [
    "VyrnForgeElementEventListener",
    "VyrnForgeCanonicalEventDetailMap",
    "addEventListener<",
    "removeEventListener<",
  ]) {
    if (!baseText.includes(marker)) {
      addFailure(failures, `typed event declaration is missing ${marker}`);
    }
  }

  for (const script of [
    "generate:custom-elements",
    "verify:consumer-foundations",
    "test:consumer-foundations",
    "verify:consumer-foundations:runtime",
  ]) {
    if (!rootPackageJson.scripts?.[script]) {
      addFailure(failures, `root package scripts are missing ${script}`);
    }
  }

  if (
    closure.declarationContract?.globalTagMap?.registeredTags !== 58 ||
    closure.declarationContract?.customElementsManifest?.registeredTags !== 58
  ) {
    addFailure(failures, "consumer foundation declaration counts must be 58");
  }
}

function verifyFixtures(root, failures, closure, architecture) {
  const manifest = readJson(root, "tests/consumers/manifest.json");
  if (manifest.supportClaim !== "partial-gmf4-runtime-evidence") {
    addFailure(
      failures,
      "consumer manifest must record partial-gmf4-runtime-evidence",
    );
  }
  if (
    !new Set(["CF-7001-CF-7002-CF-7008", "CF-7003", "CF-7004"]).has(
      manifest.currentBatch,
    )
  ) {
    addFailure(failures, "consumer manifest currentBatch is invalid");
  }

  const closureFixtures = new Map(
    (closure.consumerFixtures ?? []).map((fixture) => [fixture.id, fixture]),
  );

  for (const fixture of manifest.fixtures ?? []) {
    const allowedClaims = allowedFixtureClaims.get(fixture.id);
    if (!allowedClaims?.has(fixture.supportClaim)) {
      addFailure(
        failures,
        `${fixture.id} manifest support claim is not an allowed progression`,
      );
    }

    const fixtureDirectory = path.join(root, fixture.directory ?? "");
    const contractPath = path.join(
      fixtureDirectory,
      fixture.contractFile ?? "fixture.json",
    );
    if (!existsSync(contractPath)) {
      addFailure(failures, `${fixture.id} fixture contract is missing`);
      continue;
    }

    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (!allowedClaims?.has(contract.supportClaim)) {
      addFailure(
        failures,
        `${fixture.id} fixture support claim is not an allowed progression`,
      );
    }

    const exampleText = (fixture.exampleFiles ?? [])
      .map((file) => path.join(fixtureDirectory, file))
      .map((file) => {
        if (!existsSync(file)) {
          addFailure(
            failures,
            `${fixture.id} fixture example ${path.basename(file)} is missing`,
          );
          return "";
        }
        return readFileSync(file, "utf8");
      })
      .join("\n");

    for (const pattern of contract.requiredPatterns ?? []) {
      if (!exampleText.includes(pattern)) {
        addFailure(
          failures,
          `${fixture.id} fixture examples are missing required pattern ${pattern}`,
        );
      }
    }

    if (fixture.id === "native-html" || fixture.id === "react") {
      if (!closureFixtures.has(fixture.id)) {
        addFailure(
          failures,
          `consumer foundation metadata is missing ${fixture.id}`,
        );
      }
      for (const file of ["package.json", "tsconfig.json", "vite.config.ts"]) {
        if (!existsSync(path.join(fixtureDirectory, file))) {
          addFailure(
            failures,
            `${fixture.id} runtime fixture is missing ${file}`,
          );
        }
      }
    }
  }

  const frameworks = new Map(
    (architecture.frameworks ?? []).map((framework) => [
      framework.id,
      framework,
    ]),
  );
  for (const [frameworkId, allowedClaims] of allowedBetaClaims) {
    if (!allowedClaims.has(frameworks.get(frameworkId)?.betaClaim)) {
      addFailure(
        failures,
        `${frameworkId} beta claim is not an allowed progression`,
      );
    }
  }

  if (architecture.program?.status !== "consumer-foundation-complete") {
    addFailure(
      failures,
      "multi-framework program must be consumer-foundation-complete",
    );
  }
  if (architecture.program?.gate !== "GMF4") {
    addFailure(failures, "multi-framework program gate must be GMF4");
  }
  if (
    architecture.consumerFixturePolicy?.evidence !==
    "docs/metadata/consumer-foundations.json"
  ) {
    addFailure(
      failures,
      "multi-framework consumer policy must reference consumer-foundations.json",
    );
  }
}

export function verifyConsumerFoundations({ root = repositoryRoot } = {}) {
  const failures = [];

  for (const document of requiredDocuments) {
    if (!existsSync(path.join(root, document))) {
      addFailure(
        failures,
        `consumer foundation evidence is missing ${document}`,
      );
    }
  }

  let closure;
  let architecture;
  try {
    closure = readJson(root, "docs/metadata/consumer-foundations.json");
    architecture = readJson(root, "docs/metadata/multi-framework.json");
  } catch (error) {
    return [`consumer foundation metadata is invalid: ${error.message}`];
  }

  verifyTasks(root, failures, closure);
  verifyPackageContract(root, failures, closure);
  verifyFixtures(root, failures, closure, architecture);

  for (const evidence of closure.evidence ?? []) {
    if (!existsSync(path.join(root, evidence))) {
      addFailure(
        failures,
        `consumer foundation evidence is missing ${evidence}`,
      );
    }
  }
  if (
    !Array.isArray(closure.unresolvedBlockers) ||
    closure.unresolvedBlockers.length !== 0
  ) {
    addFailure(
      failures,
      "consumer foundation unresolvedBlockers must be empty",
    );
  }

  if (root === repositoryRoot) {
    try {
      execFileSync(
        process.execPath,
        [
          path.join(
            repositoryRoot,
            "scripts/generate-ui-elements-manifest.mjs",
          ),
          "--check",
        ],
        { cwd: repositoryRoot, stdio: "pipe" },
      );
    } catch (error) {
      addFailure(
        failures,
        `custom-elements.json generation check failed: ${String(error.stderr ?? error.message)}`,
      );
    }
  }

  return [...new Set(failures)].sort();
}

export function assertConsumerFoundations(options) {
  const failures = verifyConsumerFoundations(options);
  if (failures.length > 0) {
    throw new Error(
      `Consumer foundation verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertConsumerFoundations();
  console.log(
    "Consumer foundations passed: CF-7001, CF-7002, and CF-7008 provide packed native HTML and React Custom Element consumers plus the 58-tag declaration and metadata contract.",
  );
}
