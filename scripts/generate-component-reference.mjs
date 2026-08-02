import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function frameworkExamples(component) {
  const parity = component.frameworkParity;
  const nativeTag = parity?.native?.target ?? null;

  return {
    react: {
      label: "React",
      status: parity?.react?.status ?? "not-supported",
      package: parity?.react?.package ?? null,
      setup: component.importExample ?? "",
      example: component.basicUsageExample ?? "",
      note: "React uses the first-class @vyrnforge/ui-components renderer. Direct Custom Element consumption remains supported for interop scenarios.",
    },
    "native-html": {
      label: "Native HTML",
      status: parity?.native?.status ?? "not-supported",
      package: parity?.native?.package ?? null,
      setup: nativeTag ? 'import "@vyrnforge/ui-elements/register";' : "",
      example: nativeTag ? `<${nativeTag}></${nativeTag}>` : "",
      note: "Native HTML consumes @vyrnforge/ui-elements directly. Complex values are assigned as DOM properties and canonical vf-* events remain native CustomEvents.",
    },
    angular: {
      label: "Angular",
      status:
        parity?.angular?.status ??
        (nativeTag ? "consumer-contract-verified" : "not-supported"),
      package:
        parity?.angular?.consumes ??
        (nativeTag ? "@vyrnforge/ui-elements" : null),
      setup: nativeTag
        ? 'schemas: [CUSTOM_ELEMENTS_SCHEMA]\n// import "@vyrnforge/ui-elements/register" from application bootstrap'
        : "",
      example: nativeTag ? `<${nativeTag}></${nativeTag}>` : "",
      note: "Angular consumes the same Custom Element contract. The packed Angular consumer is verified at framework level; this component status remains sourced from canonical component parity metadata until GMF4 closes. Use property/event bindings; the optional vfFormControl adapter is reserved for Angular Forms integration.",
    },
    vue: {
      label: "Vue",
      status:
        parity?.vue?.status ??
        (nativeTag ? "consumer-contract-verified" : "not-supported"),
      package:
        parity?.vue?.consumes ?? (nativeTag ? "@vyrnforge/ui-elements" : null),
      setup: nativeTag
        ? "compilerOptions: { isCustomElement: (tag) => tag.startsWith('vf-') }"
        : "",
      example: nativeTag ? `<${nativeTag}></${nativeTag}>` : "",
      note: "Vue consumes the same Custom Element contract. The packed Vue consumer is verified at framework level; this component status remains sourced from canonical component parity metadata until GMF4 closes. Use .prop for object-valued properties; the optional reference wrapper maps modelValue to canonical value/checked events.",
    },
  };
}

export function buildComponentReference({ root = repositoryRoot } = {}) {
  const catalog = readJson(root, "docs/metadata/components.json");
  const contracts = readJson(root, "docs/metadata/component-contracts.json");
  const manifest = readJson(root, "packages/ui-elements/custom-elements.json");

  const contractById = new Map(
    (contracts.componentContracts ?? []).map((contract) => [
      contract.id,
      contract,
    ]),
  );
  const nativeByTag = new Map(
    (manifest.modules ?? [])
      .flatMap((module) => module.declarations ?? [])
      .filter((declaration) => declaration.customElement && declaration.tagName)
      .map((declaration) => [declaration.tagName, declaration]),
  );

  const components = (catalog.components ?? [])
    .filter(
      (component) =>
        component.frameworkParity?.betaScope === "included" &&
        component.maturity !== "internal",
    )
    .map((component) => {
      const nativeTag = component.frameworkParity?.native?.target ?? null;
      const nativeDeclaration = nativeTag ? nativeByTag.get(nativeTag) : null;
      const contract = contractById.get(component.id) ?? null;

      return {
        id: component.id,
        displayName: component.displayName,
        category: component.category,
        maturity: component.maturity,
        purpose: component.purpose,
        knownLimitations: component.knownLimitations ?? [],
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
        frameworks: frameworkExamples(component),
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
    })
    .sort((left, right) =>
      left.category === right.category
        ? left.displayName.localeCompare(right.displayName)
        : left.category.localeCompare(right.category),
    );

  return {
    schemaVersion: 1,
    generatedFrom: [
      "docs/metadata/components.json",
      "docs/metadata/component-contracts.json",
      "packages/ui-elements/custom-elements.json",
    ],
    tasks: ["CF-7011", "CF-7012"],
    scope: {
      componentCount: components.length,
      frameworkTabs: ["react", "native-html", "angular", "vue"],
      contractDetailPolicy:
        "Detailed properties, attributes, events, slots, methods, accessibility, and form-association fields are emitted only when present in the canonical component-contract catalog. The generator does not invent missing contracts.",
    },
    components,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputPath = path.join(
    repositoryRoot,
    "docs/generated/component-reference.json",
  );
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    `${JSON.stringify(buildComponentReference(), null, 2)}\n`,
    "utf8",
  );
  console.log(`Generated ${path.relative(repositoryRoot, outputPath)}.`);
}
