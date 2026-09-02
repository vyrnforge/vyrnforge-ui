import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const allowedFixtureClaims = new Map([
  ["native-html", new Set(["packed-runtime-verified"])],
  ["react", new Set(["packed-react-public-package-runtime-verified"])],
  ["angular", new Set(["packed-angular-runtime-verified"])],
  ["vue", new Set(["packed-vue-runtime-verified"])],
]);

const allowedBetaClaims = new Map([
  ["native-html", new Set(["packed-consumer-verified"])],
  ["react", new Set(["react-public-package-consumer-verified"])],
  ["angular", new Set(["packed-consumer-verified"])],
  ["vue", new Set(["packed-consumer-verified"])],
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
  "tests/consumers/vue/package.json",
  "tests/consumers/vue/src/main.ts",
  "tests/consumers/vue/src/App.vue",
  "docs/metadata/vue-consumer.json",
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

function sameStringSet(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function collectRegistryDefinitions(text) {
  return [
    ...text.matchAll(
      /tagName:\s*"([^"]+)"\s*,\s*constructor:\s*([A-Za-z0-9_]+)/gs,
    ),
  ].map((match) => ({ tagName: match[1], className: match[2] }));
}

function verifyPackageContract(root, failures, metadata) {
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

  const contracts = loadCanonicalComponentContracts({ root });
  const canonicalContractEventNames = contracts.events.map(
    (event) => event.name,
  );
  const typedEventNames = collectCanonicalEventNames(eventsText);
  if (typedEventNames.length === 0) {
    addFailure(failures, "canonical event detail map is missing or empty");
  } else if (!sameStringSet(typedEventNames, canonicalContractEventNames)) {
    addFailure(
      failures,
      "canonical event detail map must cover canonical contract event vocabulary",
    );
  }
  if (
    JSON.stringify(manifest.vyrnforge?.eventVocabulary ?? []) !==
    JSON.stringify(canonicalContractEventNames)
  ) {
    addFailure(
      failures,
      "custom-elements.json event vocabulary must match canonical component contracts",
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
    metadata.declarationContract?.globalTagMap?.registeredTags !== 58 ||
    metadata.declarationContract?.customElementsManifest?.registeredTags !== 58
  ) {
    addFailure(failures, "consumer foundation declaration counts must be 58");
  }
}

function verifyFixtures(root, failures, metadata, architecture) {
  const manifest = readJson(root, "tests/consumers/manifest.json");
  const metadataFixtures = new Map(
    (metadata.consumerFixtures ?? []).map((fixture) => [fixture.id, fixture]),
  );

  for (const fixture of manifest.fixtures ?? []) {
    const allowedClaims = allowedFixtureClaims.get(fixture.id);
    if (!allowedClaims?.has(fixture.supportClaim)) {
      addFailure(
        failures,
        `${fixture.id} manifest support claim is not a current verified claim`,
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
        `${fixture.id} fixture support claim is not a current verified claim`,
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

    for (const pattern of contract.forbiddenPatterns ?? []) {
      if (exampleText.includes(pattern)) {
        addFailure(
          failures,
          `${fixture.id} fixture examples contain forbidden pattern ${pattern}`,
        );
      }
    }

    if (fixture.id === "native-html" || fixture.id === "react") {
      if (!metadataFixtures.has(fixture.id)) {
        addFailure(
          failures,
          `consumer foundation metadata is missing ${fixture.id}`,
        );
      }
    }

    if (
      fixture.id === "native-html" ||
      fixture.id === "react" ||
      fixture.id === "vue"
    ) {
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
        `${frameworkId} beta claim is not a current verified claim`,
      );
    }
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

  let metadata;
  let architecture;
  try {
    metadata = readJson(root, "docs/metadata/consumer-foundations.json");
    architecture = readJson(root, "docs/metadata/multi-framework.json");
  } catch (error) {
    return [`consumer foundation metadata is invalid: ${error.message}`];
  }

  verifyPackageContract(root, failures, metadata);
  verifyFixtures(root, failures, metadata, architecture);

  for (const evidence of metadata.evidence ?? []) {
    if (!existsSync(path.join(root, evidence))) {
      addFailure(
        failures,
        `consumer foundation evidence is missing ${evidence}`,
      );
    }
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
    "Consumer foundations passed: packed web consumers, Custom Element declarations, canonical events, and generated metadata are aligned.",
  );
}
