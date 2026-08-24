import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const unresolvedValues = new Set([
  "requires-verification",
  "not-applicable",
  "pending",
]);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && !unresolvedValues.has(trimmed) ? trimmed : null;
}

function cleanList(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => cleanText(entry))
      .map((entry) => entry.trim());
  }
  const cleaned = cleanText(value);
  return cleaned ? [cleaned] : [];
}

function typeLabel(type) {
  if (!type) return null;
  if (typeof type === "string") return type;
  if (type.typeName) return type.typeName;
  if (type.kind === "enum" && Array.isArray(type.values)) {
    return type.values.join(" | ");
  }
  return type.kind ?? null;
}

function frameworkNote(frameworkId, status) {
  if (status === "not-supported") {
    return "No current public consumption path is declared for this component on this framework surface.";
  }
  if (frameworkId === "react") {
    return "React uses the first-class @vyrnforge/ui-components renderer when the component belongs to the shared non-grid surface; specialized React-only modules retain their own package status.";
  }
  if (frameworkId === "native-html") {
    return "Native HTML consumes @vyrnforge/ui-elements directly through canonical vf-* Custom Elements and events.";
  }
  if (frameworkId === "angular") {
    return "Angular is currently a verified consumer of the canonical Custom Element contract. A first-class Angular package must not be claimed until its distribution gate passes.";
  }
  return "Vue is currently a verified consumer of the canonical Custom Element contract. A first-class Vue package must not be claimed until its distribution gate passes.";
}

function frameworkExamples(component, context) {
  const parity = component.frameworkParity ?? {};
  const nativeTarget = cleanText(parity.native?.target);
  const nativeTag = nativeTarget?.startsWith("vf-") ? nativeTarget : null;
  const packageMeta = context.multiFrameworkPackageByName.get(
    component.package,
  );
  const packageRuntime = packageMeta?.runtime ?? null;
  const packageStatus = packageMeta?.status ?? null;
  const reactStatus =
    parity.react?.status ??
    (component.publicExport && packageRuntime === "react"
      ? (packageStatus ?? "current")
      : "not-supported");
  const nativeStatus = parity.native?.status ?? "not-supported";
  const angularStatus = parity.angular?.status ?? "not-supported";
  const vueStatus = parity.vue?.status ?? "not-supported";
  const reactSetup = cleanText(component.importExample) ?? "";
  const reactExample = cleanText(component.basicUsageExample) ?? "";

  return {
    react: {
      label: "React",
      status: reactStatus,
      package:
        parity.react?.package ??
        (packageRuntime === "react" ? component.package : null),
      setup: reactStatus === "not-supported" ? "" : reactSetup,
      example: reactStatus === "not-supported" ? "" : reactExample,
      note: frameworkNote("react", reactStatus),
    },
    "native-html": {
      label: "Native HTML",
      status: nativeStatus,
      package: parity.native?.package ?? null,
      setup: nativeTag ? 'import "@vyrnforge/ui-elements/register";' : "",
      example: nativeTag ? `<${nativeTag}></${nativeTag}>` : "",
      note: frameworkNote("native-html", nativeStatus),
    },
    angular: {
      label: "Angular",
      status: angularStatus,
      package:
        parity.angular?.consumes ??
        (nativeTag ? "@vyrnforge/ui-elements" : null),
      setup: nativeTag
        ? 'schemas: [CUSTOM_ELEMENTS_SCHEMA]\n// import "@vyrnforge/ui-elements/register" from application bootstrap'
        : "",
      example: nativeTag ? `<${nativeTag}></${nativeTag}>` : "",
      note: frameworkNote("angular", angularStatus),
    },
    vue: {
      label: "Vue",
      status: vueStatus,
      package:
        parity.vue?.consumes ?? (nativeTag ? "@vyrnforge/ui-elements" : null),
      setup: nativeTag
        ? "compilerOptions: { isCustomElement: (tag) => tag.startsWith('vf-') }"
        : "",
      example: nativeTag ? `<${nativeTag}></${nativeTag}>` : "",
      note: frameworkNote("vue", vueStatus),
    },
  };
}

function loadContext(root) {
  const catalog = readJson(root, "docs/metadata/components.json");
  const packageCatalog = readJson(root, "docs/metadata/packages.json");
  const multiFramework = readJson(root, "docs/metadata/multi-framework.json");
  const patterns = existsSync(path.join(root, "docs/metadata/patterns.json"))
    ? readJson(root, "docs/metadata/patterns.json")
    : { patterns: [] };
  const contracts = loadCanonicalComponentContracts({ root });
  const manifest = readJson(root, "packages/ui-elements/custom-elements.json");
  const packageByName = new Map(
    (packageCatalog.packages ?? []).map((entry) => [entry.name, entry]),
  );
  const multiFrameworkPackageByName = new Map(
    (multiFramework.packages ?? []).map((entry) => [entry.name, entry]),
  );
  const nativeByTag = new Map(
    (manifest.modules ?? [])
      .flatMap((module) => module.declarations ?? [])
      .filter((declaration) => declaration.customElement && declaration.tagName)
      .map((declaration) => [declaration.tagName, declaration]),
  );
  return {
    catalog,
    packageCatalog,
    packageByName,
    multiFramework,
    multiFrameworkPackageByName,
    patterns,
    contracts,
    nativeByTag,
  };
}

function componentRecord(component, context) {
  const nativeTarget = cleanText(component.frameworkParity?.native?.target);
  const nativeTag = nativeTarget?.startsWith("vf-") ? nativeTarget : null;
  const nativeDeclaration = nativeTag
    ? context.nativeByTag.get(nativeTag)
    : null;
  const contract = context.contracts.componentById.get(component.id) ?? null;
  return {
    id: component.id,
    displayName: component.displayName,
    package: component.package ?? null,
    category: component.category,
    maturity: component.maturity,
    availability: component.publicExport
      ? "available"
      : component.maturity === "planned"
        ? "planned"
        : "not-public",
    purpose: cleanText(component.purpose) ?? "",
    guidance: {
      useWhen: cleanText(component.useWhen),
      avoidWhen: cleanText(component.avoidWhen),
      aiUsageNotes: cleanText(component.aiUsageNotes),
      relatedComponents: component.relatedComponents ?? [],
    },
    accessibilityNotes: cleanText(component.accessibilityNotes),
    knownLimitations: cleanList(component.knownLimitations),
    styling: {
      classes: component.cssClasses ?? [],
      variables: component.cssVariables ?? [],
    },
    docsPath: cleanText(component.docsPath),
    playgroundPath: cleanText(component.playgroundPath),
    source: {
      componentMetadata: "docs/metadata/components.json",
      contractMetadata: contract
        ? "docs/metadata/component-contracts.json"
        : null,
      customElementsManifest: nativeDeclaration
        ? "packages/ui-elements/custom-elements.json"
        : null,
    },
    nativeDeclaration: nativeDeclaration
      ? {
          name: nativeDeclaration.name,
          tagName: nativeDeclaration.tagName,
          description: nativeDeclaration.description ?? "",
        }
      : null,
    frameworks: frameworkExamples(component, context),
    contract: contract
      ? {
          properties: contract.properties ?? [],
          attributes: contract.attributes ?? [],
          events: contract.events ?? [],
          slots: contract.slots ?? [],
          methods: contract.methods ?? [],
          accessibility: contract.accessibility ?? [],
          formAssociation: contract.formAssociation ?? "none",
        }
      : null,
  };
}

export function buildConsumerKnowledge({ root = repositoryRoot } = {}) {
  const context = loadContext(root);
  const components = (context.catalog.components ?? [])
    .filter(
      (component) =>
        component.maturity !== "internal" &&
        (component.publicExport || component.maturity === "planned"),
    )
    .map((component) => componentRecord(component, context))
    .sort((left, right) =>
      left.category === right.category
        ? left.displayName.localeCompare(right.displayName)
        : left.category.localeCompare(right.category),
    );
  const packages = (context.packageCatalog.packages ?? []).map((entry) => {
    const frameworkPackage = context.multiFrameworkPackageByName.get(
      entry.name,
    );
    return {
      name: entry.name,
      purpose: entry.purpose,
      status: entry.status,
      releaseTrack: entry.releaseTrack ?? null,
      runtime: frameworkPackage?.runtime ?? null,
      cssImport: entry.cssImport ?? null,
    };
  });
  const frameworks = (context.multiFramework.frameworks ?? []).map((entry) => ({
    id: entry.id,
    supportLevel: entry.supportLevel,
    renderer: entry.renderer,
  }));
  const patterns = (context.patterns.patterns ?? []).map((pattern) => ({
    ...pattern,
  }));

  return {
    schemaVersion: 1,
    purpose:
      "Generated consumer knowledge for AI context retrieval and human playground/reference surfaces. Canonical metadata remains the source of truth.",
    generatedFrom: [
      "docs/metadata/components.json",
      "docs/metadata/component-contracts.json",
      "docs/metadata/patterns.json",
      "docs/metadata/packages.json",
      "docs/metadata/multi-framework.json",
      "packages/ui-elements/custom-elements.json",
    ],
    packages,
    frameworks,
    patterns,
    components,
  };
}

export function buildComponentReference({ root = repositoryRoot } = {}) {
  const context = loadContext(root);
  const knowledge = buildConsumerKnowledge({ root });
  const includedIds = new Set(
    (context.catalog.components ?? [])
      .filter(
        (component) =>
          component.publicExport &&
          component.frameworkParity?.betaScope === "included" &&
          component.maturity !== "internal",
      )
      .map((component) => component.id),
  );
  const components = knowledge.components.filter((component) =>
    includedIds.has(component.id),
  );
  return {
    schemaVersion: 2,
    generatedFrom: knowledge.generatedFrom,
    scope: {
      componentCount: components.length,
      frameworkTabs: ["react", "native-html", "angular", "vue"],
      contractDetailPolicy:
        "Detailed contract fields are emitted only from the canonical component-contract catalog. Missing contracts are never inferred from framework implementations.",
    },
    components,
  };
}

function compactFramework(usage) {
  return {
    status: usage.status,
    package: usage.package,
    ...(usage.setup ? { setup: usage.setup } : {}),
    ...(usage.example ? { example: usage.example } : {}),
  };
}

function compactContract(contract) {
  if (!contract) return null;
  return {
    properties: (contract.properties ?? []).map((property) => ({
      name: property.name,
      type: typeLabel(property.type),
      required: property.required ?? false,
      ...(property.default !== undefined ? { default: property.default } : {}),
    })),
    events: (contract.events ?? []).map((event) => ({
      name: event.name,
      ...(event.detail ? { detail: typeLabel(event.detail) } : {}),
    })),
    slots: (contract.slots ?? []).map((slot) => slot.name),
    methods: (contract.methods ?? []).map((method) => method.name),
    accessibility: contract.accessibility ?? [],
    formAssociation: contract.formAssociation ?? "none",
  };
}

function componentContextSlice(component) {
  return {
    schemaVersion: 1,
    id: component.id,
    name: component.displayName,
    package: component.package,
    category: component.category,
    maturity: component.maturity,
    availability: component.availability,
    purpose: component.purpose,
    guidance: component.guidance,
    accessibility: [
      ...(component.accessibilityNotes ? [component.accessibilityNotes] : []),
      ...(component.contract?.accessibility ?? []),
    ],
    knownLimitations: component.knownLimitations,
    styling: component.styling,
    frameworks: Object.fromEntries(
      Object.entries(component.frameworks).map(([id, usage]) => [
        id,
        compactFramework(usage),
      ]),
    ),
    contract: compactContract(component.contract),
    source: component.source,
  };
}

export function buildAiContextArtifacts({ root = repositoryRoot } = {}) {
  const knowledge = buildConsumerKnowledge({ root });
  const components = Object.fromEntries(
    knowledge.components.map((component) => [
      component.id,
      componentContextSlice(component),
    ]),
  );
  const categoryMap = new Map();
  for (const component of knowledge.components) {
    const values = categoryMap.get(component.category) ?? [];
    values.push({
      id: component.id,
      name: component.displayName,
      package: component.package,
      maturity: component.maturity,
      availability: component.availability,
      purpose: component.purpose,
      context: `ai-context/components/${component.id}.json`,
    });
    categoryMap.set(component.category, values);
  }
  const categories = Object.fromEntries(
    [...categoryMap.entries()].map(([category, values]) => [
      category,
      {
        schemaVersion: 1,
        category,
        components: values,
      },
    ]),
  );
  const patterns = Object.fromEntries(
    knowledge.patterns.map((pattern) => [
      pattern.id,
      {
        schemaVersion: 1,
        ...pattern,
        componentContexts: (pattern.components ?? []).map(
          (id) => `ai-context/components/${id}.json`,
        ),
      },
    ]),
  );
  const index = {
    schemaVersion: 1,
    purpose: "Minimal bootstrap index for task-scoped VyrnForge consumption.",
    protocol: {
      namedComponent:
        "If the component is already known, read only its ai-context/components/<id>.json slice.",
      taskOrPattern:
        "For a workflow or page task, inspect the pattern list first, then read the selected pattern slice and only the component slices it references.",
      discovery:
        "When the component is unknown, read the smallest matching category slice before opening component slices.",
      escalation:
        "Read architecture or policy Markdown only when the task changes architecture, package boundaries, support claims, release policy, or another cross-cutting contract.",
    },
    packages: knowledge.packages.map(
      ({ name, status, releaseTrack, runtime }) => ({
        name,
        status,
        releaseTrack,
        runtime,
      }),
    ),
    frameworks: knowledge.frameworks,
    categories: Object.keys(categories)
      .sort()
      .map((category) => ({
        id: category,
        context: `ai-context/categories/${category}.json`,
      })),
    patterns: knowledge.patterns.map((pattern) => ({
      id: pattern.id,
      name: pattern.displayName,
      category: pattern.category,
      context: `ai-context/patterns/${pattern.id}.json`,
    })),
    components: knowledge.components.map((component) => ({
      id: component.id,
      name: component.displayName,
      category: component.category,
      availability: component.availability,
      context: `ai-context/components/${component.id}.json`,
    })),
  };
  return { index, categories, components, patterns };
}

function writeJson(root, relativePath, value) {
  const outputPath = path.join(root, relativePath);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function writeConsumerKnowledge({ root = repositoryRoot } = {}) {
  const knowledge = buildConsumerKnowledge({ root });
  const reference = buildComponentReference({ root });
  const ai = buildAiContextArtifacts({ root });
  const aiRoot = path.join(root, "docs/generated/ai-context");
  rmSync(aiRoot, { recursive: true, force: true });
  writeJson(root, "docs/generated/consumer-knowledge.json", knowledge);
  writeJson(root, "docs/generated/component-reference.json", reference);
  writeJson(root, "docs/generated/ai-context/index.json", ai.index);
  for (const [category, value] of Object.entries(ai.categories)) {
    writeJson(
      root,
      `docs/generated/ai-context/categories/${category}.json`,
      value,
    );
  }
  for (const [id, value] of Object.entries(ai.components)) {
    writeJson(root, `docs/generated/ai-context/components/${id}.json`, value);
  }
  for (const [id, value] of Object.entries(ai.patterns)) {
    writeJson(root, `docs/generated/ai-context/patterns/${id}.json`, value);
  }
  console.log(
    `Generated consumer knowledge, ${Object.keys(ai.components).length} AI component slices, and ${Object.keys(ai.patterns).length} AI pattern slices.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeConsumerKnowledge();
}
