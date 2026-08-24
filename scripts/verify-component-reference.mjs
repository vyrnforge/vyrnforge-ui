import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAiContextArtifacts,
  buildComponentReference,
  buildConsumerKnowledge,
} from "./generate-component-reference.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const generatedPath = "docs/generated/component-reference.json";
const knowledgePath = "docs/generated/consumer-knowledge.json";
const aiRoot = "docs/generated/ai-context";
const programMetadataPath = "docs/metadata/component-reference-program.json";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function compareJson(root, relativePath, expected, failures, label) {
  if (!existsSync(path.join(root, relativePath))) {
    failures.push(`${label} is missing: ${relativePath}`);
    return;
  }
  const actual = json(root, relativePath);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${label} is stale; run npm run generate:consumer-knowledge`);
  }
}

function filesRecursively(root, relativeDir) {
  const absolute = path.join(root, relativeDir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(relativeDir, entry.name);
    return entry.isDirectory() ? filesRecursively(root, relative) : [relative];
  });
}

export function verifyComponentReference({ root = repositoryRoot } = {}) {
  const failures = [];
  if (!existsSync(path.join(root, programMetadataPath))) {
    return [`consumer knowledge metadata is missing: ${programMetadataPath}`];
  }
  const program = json(root, programMetadataPath);
  if (program.status !== "current") {
    failures.push("consumer knowledge pipeline status must be current");
  }
  for (const requiredSource of [
    "docs/metadata/components.json",
    "docs/metadata/component-contracts.json",
    "docs/metadata/patterns.json",
    "docs/metadata/packages.json",
    "docs/metadata/multi-framework.json",
  ]) {
    if (!(program.sourceOfTruth ?? []).includes(requiredSource)) {
      failures.push(
        `consumer knowledge metadata is missing source ${requiredSource}`,
      );
    }
  }

  const expectedKnowledge = buildConsumerKnowledge({ root });
  const expectedReference = buildComponentReference({ root });
  const expectedAi = buildAiContextArtifacts({ root });
  compareJson(
    root,
    knowledgePath,
    expectedKnowledge,
    failures,
    "consumer knowledge",
  );
  compareJson(
    root,
    generatedPath,
    expectedReference,
    failures,
    "component reference",
  );
  compareJson(
    root,
    `${aiRoot}/index.json`,
    expectedAi.index,
    failures,
    "AI context index",
  );
  for (const [category, value] of Object.entries(expectedAi.categories)) {
    compareJson(
      root,
      `${aiRoot}/categories/${category}.json`,
      value,
      failures,
      `${category} AI category context`,
    );
  }
  for (const [id, value] of Object.entries(expectedAi.components)) {
    compareJson(
      root,
      `${aiRoot}/components/${id}.json`,
      value,
      failures,
      `${id} AI component context`,
    );
  }
  for (const [id, value] of Object.entries(expectedAi.patterns)) {
    compareJson(
      root,
      `${aiRoot}/patterns/${id}.json`,
      value,
      failures,
      `${id} AI pattern context`,
    );
  }

  const expectedAiFiles = new Set([
    `${aiRoot}/index.json`,
    ...Object.keys(expectedAi.categories).map(
      (id) => `${aiRoot}/categories/${id}.json`,
    ),
    ...Object.keys(expectedAi.components).map(
      (id) => `${aiRoot}/components/${id}.json`,
    ),
    ...Object.keys(expectedAi.patterns).map(
      (id) => `${aiRoot}/patterns/${id}.json`,
    ),
  ]);
  for (const file of filesRecursively(root, aiRoot).filter((entry) =>
    entry.endsWith(".json"),
  )) {
    if (!expectedAiFiles.has(file)) {
      failures.push(`unexpected stale AI context artifact: ${file}`);
    }
  }

  const catalog = json(root, "docs/metadata/components.json");
  const included = (catalog.components ?? []).filter(
    (component) =>
      component.publicExport &&
      component.frameworkParity?.betaScope === "included" &&
      component.maturity !== "internal",
  );
  if (expectedReference.scope?.componentCount !== included.length) {
    failures.push(
      "component reference must cover every public beta-scope component",
    );
  }
  const frameworkIds = ["react", "native-html", "angular", "vue"];
  for (const component of expectedReference.components ?? []) {
    const source = included.find((entry) => entry.id === component.id);
    for (const frameworkId of frameworkIds) {
      if (!component.frameworks?.[frameworkId]) {
        failures.push(
          `${component.id}: generated framework usage is missing ${frameworkId}`,
        );
      }
    }
    if (
      source?.frameworkParity?.angular?.status &&
      component.frameworks.angular.status !==
        source.frameworkParity.angular.status
    ) {
      failures.push(
        `${component.id}: Angular status must remain sourced from canonical component parity metadata`,
      );
    }
    if (
      source?.frameworkParity?.vue?.status &&
      component.frameworks.vue.status !== source.frameworkParity.vue.status
    ) {
      failures.push(
        `${component.id}: Vue status must remain sourced from canonical component parity metadata`,
      );
    }
  }

  const docsPage = read(root, "apps/docs/src/ComponentReferencePage.tsx");
  for (const marker of [
    "consumer-knowledge.json",
    'label: "React"',
    'label: "Native HTML"',
    'label: "Angular"',
    'label: "Vue"',
    "AI context slice",
  ]) {
    if (!docsPage.includes(marker))
      failures.push(`consumer knowledge viewer is missing ${marker}`);
  }
  const aiPage = read(root, "apps/docs/src/AiContextIndexPage.tsx");
  for (const marker of [
    "ai-context/index.json",
    "Task-scoped retrieval",
    "components",
  ]) {
    if (!aiPage.includes(marker))
      failures.push(`AI context index viewer is missing ${marker}`);
  }
  const playgroundPage = read(
    root,
    "examples/basic-playground/src/components/ComponentDemoPage.tsx",
  );
  for (const marker of [
    "consumer-knowledge.json",
    "framework-usage",
    "canonicalKnowledge",
  ]) {
    if (!playgroundPage.includes(marker))
      failures.push(`playground component reference is missing ${marker}`);
  }
  for (const file of filesRecursively(
    root,
    "examples/basic-playground/src/pages/reference",
  ).filter((entry) => entry.endsWith(".tsx"))) {
    if (
      /\bstatus="(?:stable|beta-stable|alpha-stable|experimental|planned|deprecated)"/.test(
        read(root, file),
      )
    ) {
      failures.push(
        `${file}: component maturity must come from generated consumer knowledge, not a hand-written status prop`,
      );
    }
  }
  const routes = read(root, "examples/basic-playground/src/app/routes.ts");
  for (const marker of [
    'visibility?: "public" | "internal"',
    'group: "Internal"',
    'group: "Advanced Modules"',
    "consumer-knowledge.json",
  ]) {
    if (!routes.includes(marker))
      failures.push(`playground routes are missing ${marker}`);
  }
  const rolloutResidueFiles = [
    "docs/metadata/component-reference-program.json",
    "docs/testing/generated-component-reference.md",
    "scripts/generate-component-reference.mjs",
    "scripts/verify-component-reference.test.mjs",
  ];
  const rolloutPattern = /GMF4|CF-7011|CF-7012|npm run quality/;
  for (const file of rolloutResidueFiles) {
    if (rolloutPattern.test(read(root, file))) {
      failures.push(
        `${file}: retired rollout/task language remains in the current consumer knowledge pipeline`,
      );
    }
  }
  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyComponentReference();
  if (failures.length > 0) {
    console.error("Consumer knowledge verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Consumer knowledge verification passed.");
  }
}
