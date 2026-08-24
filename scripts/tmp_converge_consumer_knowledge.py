from pathlib import Path
import json
import textwrap

ROOT = Path(__file__).resolve().parents[1]


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(textwrap.dedent(content).lstrip(), encoding="utf-8")


write(
    "docs/metadata/patterns.json",
    r'''
    {
      "schemaVersion": 1,
      "sourceOfTruth": {
        "canonical": true,
        "scope": "reusable application composition patterns and AI task-routing hints",
        "documentation": "examples/basic-playground/README.md"
      },
      "patterns": [
        {
          "id": "resource-list",
          "displayName": "Resource List",
          "category": "data-management",
          "purpose": "Compact application list for resources, metadata, status, and row-level actions without introducing grid semantics.",
          "useWhen": "Use for moderate resource collections where each item needs a readable identity, metadata, status, and a few actions.",
          "avoidWhen": "Use UniversalDataGrid when columnar comparison, sorting, filtering, resizing, grouping, or grid state is the primary interaction model.",
          "components": ["badge", "button", "more-button", "toast-provider", "use-toast"],
          "playgroundRoute": "/resource-list",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["resource list", "records", "assets", "row actions", "status list"]
        },
        {
          "id": "detail",
          "displayName": "Detail Page",
          "category": "application-layout",
          "purpose": "Detail surface with identity, status, metadata, related information, and contextual actions.",
          "useWhen": "Use for a route focused on one resource or entity with several readable sections and actions.",
          "avoidWhen": "Avoid forcing a detail page into a dense table or a modal when the workflow needs durable navigation and deep linking.",
          "components": ["badge", "button", "more-button"],
          "playgroundRoute": "/detail",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["detail page", "entity details", "resource page", "metadata", "actions"]
        },
        {
          "id": "settings",
          "displayName": "Settings",
          "category": "forms",
          "purpose": "Sectioned settings workflow using labelled controls, validation, immediate settings, and explicit save feedback.",
          "useWhen": "Use for durable application or account configuration where related settings need clear labels, descriptions, validation, and save behavior.",
          "avoidWhen": "Avoid mixing settings with unrelated transactional workflows; keep application persistence and authorization outside VyrnForge.",
          "components": ["autocomplete", "button", "field", "radio-group", "select", "switch", "text-input", "toast-provider", "use-toast", "validation-message"],
          "playgroundRoute": "/settings",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["settings", "preferences", "configuration", "account settings", "workspace settings"]
        },
        {
          "id": "form",
          "displayName": "Form",
          "category": "forms",
          "purpose": "General application form composition with labelled fields, varied input types, validation, submission feedback, and application-owned state.",
          "useWhen": "Use when a workflow collects several related values and needs clear validation and submission actions.",
          "avoidWhen": "Avoid putting business validation, persistence, authorization, or backend workflow execution inside VyrnForge components.",
          "components": ["autocomplete", "button", "checkbox", "date-input", "date-time-input", "field", "inline-message", "multi-select", "number-input", "radio-group", "select", "text-input", "toast-provider", "use-toast", "validation-message"],
          "playgroundRoute": "/form",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["form", "data entry", "validation", "submit", "request form"]
        },
        {
          "id": "filter-form",
          "displayName": "Filter Form",
          "category": "data-management",
          "purpose": "Compact filter composition for operational lists and reports using search, choice, and date controls.",
          "useWhen": "Use when a list or report needs several explicit filters that remain application-owned and easy to reset.",
          "avoidWhen": "Avoid coupling filter controls to fetching or global state inside VyrnForge; adapters and application code own those effects.",
          "components": ["autocomplete", "button", "date-input", "field", "search-input", "select", "stack", "inline"],
          "playgroundRoute": "/filter-form",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["filters", "search form", "report filters", "list filters", "date filter"]
        },
        {
          "id": "assignment-patterns",
          "displayName": "Assignments",
          "category": "data-management",
          "purpose": "Bounded dual-list assignment workflow for moving known options between available and assigned collections.",
          "useWhen": "Use for moderate known collections where users need to review both available and assigned items while making changes.",
          "avoidWhen": "Avoid for very large, remote, or hierarchical collections that need a different collection/search architecture.",
          "components": ["badge", "button", "stack", "transfer-list", "validation-message"],
          "playgroundRoute": "/assignment-patterns",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["assignment", "transfer list", "dual list", "permissions", "memberships"]
        },
        {
          "id": "empty-error-loading",
          "displayName": "Empty, Error, and Loading",
          "category": "feedback",
          "purpose": "Route-level feedback composition for empty, failed, and loading application states.",
          "useWhen": "Use to make page and workflow state explicit while the consuming application owns loading and retry state.",
          "avoidWhen": "Use smaller inline feedback when the entire route or primary task is not affected.",
          "components": ["button", "empty-state", "error-state", "loading-state", "skeleton"],
          "playgroundRoute": "/empty-error-loading",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["empty state", "error state", "loading state", "skeleton", "retry"]
        },
        {
          "id": "admin-shell",
          "displayName": "Admin Shell",
          "category": "application-layout",
          "purpose": "Dense administration workspace with persistent top navigation, side navigation, page identity, toolbar actions, and work panels.",
          "useWhen": "Use as a composition reference for internal operations, administration, IAM, and other dense workspace applications.",
          "avoidWhen": "Avoid copying application routing, authorization, or business state into the library; the shell only defines reusable UI composition.",
          "components": ["app-shell", "badge", "button", "page-header", "page-toolbar", "panel", "search-input", "side-nav", "toolbar-button", "top-nav"],
          "playgroundRoute": "/admin-shell",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["admin", "admin shell", "operations console", "workspace", "sidebar", "top navigation"]
        },
        {
          "id": "customer-portal-shell",
          "displayName": "Customer Portal",
          "category": "application-layout",
          "purpose": "Customer-facing portal composition with predictable navigation, breadcrumbs, page identity, and related content tabs.",
          "useWhen": "Use as a composition reference for account, customer, partner, and self-service portal experiences.",
          "avoidWhen": "Keep authentication, account state, routing, permissions, and backend workflows in the consuming application.",
          "components": ["app-shell", "badge", "breadcrumbs", "button", "page-header", "panel", "side-nav", "tabs", "top-nav"],
          "playgroundRoute": "/customer-portal-shell",
          "exampleFramework": "react",
          "frameworkNeutral": true,
          "aiKeywords": ["customer portal", "account portal", "self service", "breadcrumbs", "tabs", "sidebar"]
        }
      ]
    }
    ''',
)

write(
    "scripts/generate-component-reference.mjs",
    r'''
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
        return value.filter((entry) => cleanText(entry)).map((entry) => entry.trim());
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
      const packageMeta = context.multiFrameworkPackageByName.get(component.package);
      const packageRuntime = packageMeta?.runtime ?? null;
      const packageStatus = packageMeta?.status ?? null;
      const reactStatus =
        parity.react?.status ??
        (component.publicExport && packageRuntime === "react"
          ? packageStatus ?? "current"
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
          package: parity.react?.package ??
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
          package: parity.angular?.consumes ?? (nativeTag ? "@vyrnforge/ui-elements" : null),
          setup: nativeTag
            ? 'schemas: [CUSTOM_ELEMENTS_SCHEMA]\n// import "@vyrnforge/ui-elements/register" from application bootstrap'
            : "",
          example: nativeTag ? `<${nativeTag}></${nativeTag}>` : "",
          note: frameworkNote("angular", angularStatus),
        },
        vue: {
          label: "Vue",
          status: vueStatus,
          package: parity.vue?.consumes ?? (nativeTag ? "@vyrnforge/ui-elements" : null),
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
      const nativeDeclaration = nativeTag ? context.nativeByTag.get(nativeTag) : null;
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
          contractMetadata: contract ? "docs/metadata/component-contracts.json" : null,
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
        const frameworkPackage = context.multiFrameworkPackageByName.get(entry.name);
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
      const patterns = (context.patterns.patterns ?? []).map((pattern) => ({ ...pattern }));

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
      const components = knowledge.components.filter((component) => includedIds.has(component.id));
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
          Object.entries(component.frameworks).map(([id, usage]) => [id, compactFramework(usage)]),
        ),
        contract: compactContract(component.contract),
        source: component.source,
      };
    }

    export function buildAiContextArtifacts({ root = repositoryRoot } = {}) {
      const knowledge = buildConsumerKnowledge({ root });
      const components = Object.fromEntries(
        knowledge.components.map((component) => [component.id, componentContextSlice(component)]),
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
        packages: knowledge.packages.map(({ name, status, releaseTrack, runtime }) => ({
          name,
          status,
          releaseTrack,
          runtime,
        })),
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
        writeJson(root, `docs/generated/ai-context/categories/${category}.json`, value);
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
    ''',
)

write(
    "scripts/query-ai-context.mjs",
    r'''
    import { readFileSync } from "node:fs";
    import path from "node:path";
    import { fileURLToPath } from "node:url";

    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const args = process.argv.slice(2);

    function value(flag) {
      const index = args.indexOf(flag);
      return index >= 0 ? args[index + 1] : null;
    }

    function read(relativePath) {
      return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
    }

    function output(value) {
      process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    }

    const componentId = value("--component");
    const patternId = value("--pattern");
    const categoryId = value("--category");
    const search = value("--search");
    const framework = value("--framework");

    if (componentId) {
      const component = read(`docs/generated/ai-context/components/${componentId}.json`);
      if (framework) {
        component.frameworks = component.frameworks?.[framework]
          ? { [framework]: component.frameworks[framework] }
          : {};
      }
      output(component);
    } else if (patternId) {
      output(read(`docs/generated/ai-context/patterns/${patternId}.json`));
    } else if (categoryId) {
      output(read(`docs/generated/ai-context/categories/${categoryId}.json`));
    } else if (search) {
      const index = read("docs/generated/ai-context/index.json");
      const needle = search.toLowerCase();
      output({
        components: index.components.filter((entry) =>
          `${entry.id} ${entry.name} ${entry.category}`.toLowerCase().includes(needle),
        ),
        patterns: index.patterns.filter((entry) =>
          `${entry.id} ${entry.name} ${entry.category}`.toLowerCase().includes(needle),
        ),
      });
    } else {
      output(read("docs/generated/ai-context/index.json"));
    }
    ''',
)

write(
    "docs/metadata/component-reference-program.json",
    r'''
    {
      "schemaVersion": 2,
      "status": "current",
      "purpose": "Generate one consumer-knowledge model for human reference surfaces and task-scoped AI context retrieval without duplicating canonical component, contract, pattern, package, or framework truth.",
      "sourceOfTruth": [
        "docs/metadata/components.json",
        "docs/metadata/component-contracts.json",
        "docs/metadata/patterns.json",
        "docs/metadata/packages.json",
        "docs/metadata/multi-framework.json",
        "packages/ui-elements/custom-elements.json"
      ],
      "generatedArtifacts": {
        "consumerKnowledge": "docs/generated/consumer-knowledge.json",
        "componentReference": "docs/generated/component-reference.json",
        "aiIndex": "docs/generated/ai-context/index.json",
        "aiCategories": "docs/generated/ai-context/categories/*.json",
        "aiComponents": "docs/generated/ai-context/components/*.json",
        "aiPatterns": "docs/generated/ai-context/patterns/*.json"
      },
      "frameworkSurfaces": ["react", "native-html", "angular", "vue"],
      "policy": {
        "canonicalMetadataWins": true,
        "inventMissingContracts": false,
        "inventFrameworkSupport": false,
        "generatedAiContextIsTaskScoped": true,
        "playgroundStatusIsGenerated": true,
        "humanExamplesMayRemainHandAuthoredWhenVerifiedAgainstPublicApis": true
      },
      "requiredCommands": [
        "npm run generate:consumer-knowledge",
        "npm run verify:consumer-knowledge",
        "npm run test:consumer-knowledge",
        "npm run build:docs",
        "npm run build:playground"
      ],
      "evidence": [
        "docs/testing/generated-component-reference.md",
        "docs/generated/consumer-knowledge.json",
        "docs/generated/ai-context/index.json",
        "apps/docs/src/AiContextIndexPage.tsx",
        "apps/docs/src/ComponentReferencePage.tsx",
        "examples/basic-playground/src/components/ComponentDemoPage.tsx",
        "scripts/generate-component-reference.mjs",
        "scripts/verify-component-reference.mjs"
      ]
    }
    ''',
)

write(
    "docs/testing/generated-component-reference.md",
    r'''
    # Consumer Knowledge Generation

    VyrnForge generates human reference data and compact AI retrieval context from
    the same canonical metadata. The generated layer is a projection, not a second
    source of truth.

    Canonical inputs are:

    - `docs/metadata/components.json` for component identity, package, maturity,
      purpose, usage guidance, styling hooks, and framework parity;
    - `docs/metadata/component-contracts.json` for renderer-neutral properties,
      events, slots, methods, accessibility, and form contracts;
    - `docs/metadata/patterns.json` for reusable application composition patterns;
    - `docs/metadata/packages.json` and `docs/metadata/multi-framework.json` for
      package and framework support;
    - `packages/ui-elements/custom-elements.json` for published Custom Element
      declarations.

    The generator emits:

    ```text
    docs/generated/consumer-knowledge.json
    docs/generated/component-reference.json
    docs/generated/ai-context/index.json
    docs/generated/ai-context/categories/*.json
    docs/generated/ai-context/components/*.json
    docs/generated/ai-context/patterns/*.json
    ```

    `consumer-knowledge.json` is the shared application projection used by the docs
    reference viewer and playground. The `ai-context` tree is deliberately split so
    an AI agent can read a small index, one task/category record, and only the
    component slices required for the current request.

    Angular and Vue status remains sourced from canonical framework-parity metadata.
    Current verified Custom Element consumption must not be presented as a shipped
    first-class framework package before the corresponding distribution gate passes.
    Missing contracts and unverified usage text are omitted rather than guessed.

    Run:

    ```bash
    npm run generate:consumer-knowledge
    npm run verify:consumer-knowledge
    npm run test:consumer-knowledge
    npm run query:ai-context -- --component button --framework react
    npm run query:ai-context -- --pattern settings
    ```
    ''',
)

write(
    ".ai/AI_CONTEXT.md",
    r'''
    # VyrnForge AI Bootstrap

    VyrnForge is a dependency-minimal, general-purpose web UI foundation with
    enterprise-grade depth. It is one contract-driven system spanning design tokens,
    reusable behavior, accessibility, framework integrations, components, patterns,
    tooling, and optional advanced modules. It is not only a component package or a
    data-grid library.

    ## Use the smallest context that can answer the task

    Consumer-facing AI context is generated from canonical metadata. Do not begin a
    normal UI task by loading the full documentation set.

    1. Read `docs/generated/ai-context/index.json`.
    2. If the user names a component, read only
       `docs/generated/ai-context/components/<id>.json`.
    3. If the user describes a page/workflow, inspect the matching pattern slice under
       `docs/generated/ai-context/patterns/`, then read only the component slices it
       references.
    4. If the component is unknown, inspect the smallest matching category slice under
       `docs/generated/ai-context/categories/` before opening component slices.
    5. Expand into architecture, release, or governance Markdown only for cross-cutting
       design decisions, support claims, package changes, or policy work.

    Local queries can use:

    ```bash
    npm run query:ai-context -- --component button --framework react
    npm run query:ai-context -- --pattern settings
    npm run query:ai-context -- --search combobox
    ```

    The deployed docs application exposes the same generated tree under
    `ai-context/` so tools do not need to scrape rendered documentation.

    ## Current package model

    | Package | Role | Track |
    | --- | --- | --- |
    | `@vyrnforge/ui-core` | framework-neutral design tokens, themes, density, utilities | non-grid beta |
    | `@vyrnforge/ui-behaviors` | framework-neutral controllers and interaction contracts | non-grid beta |
    | `@vyrnforge/ui-components` | first-class React renderer | non-grid beta |
    | `@vyrnforge/ui-elements` | first-class Native HTML / Custom Elements renderer | non-grid beta |
    | `@vyrnforge/ui-data-grid` | specialized React data grid | independent alpha |

    React and Native HTML are current first-class renderer/package surfaces. Angular
    and Vue are approved first-class targets and currently verified consumers of the
    Custom Element contract; do not claim first-class Angular/Vue packages until their
    distribution gates pass.

    ## Hard constraints

    - Reuse or extend existing VyrnForge components, primitives, behaviors, tokens,
      contracts, patterns, generators, or packages before inventing UI.
    - Keep shared foundations framework-neutral where practical; framework packages
      adapt shared contracts rather than becoming separate component libraries.
    - Use `--vf-*` tokens and `vf-*` classes for shared styling. `--udg-*` / `udg-*`
      remain grid-specific compatibility surface unless deliberately generalized.
    - Keep application state, business data, auth, permissions, routing, persistence,
      fetching, and backend workflows in consuming applications.
    - Do not require Redux, Zustand, Pinia, NgRx, TanStack, MUI, Tailwind, Radix,
      shadcn/ui, Chakra, Ant Design, or similar large dependencies without approval.
    - Do not deep-import package internals or infer public APIs from implementation
      details.
    - Never invent a missing contract, framework package, support level, or maturity
      state. Canonical metadata wins.
    - Accessibility, keyboard/focus behavior, i18n, responsive behavior, SSR safety,
      compatibility, and performance are core requirements.

    ## Escalation map

    Use these only when the compact generated context is insufficient:

    - product identity: `docs/governance/01-project-source-of-truth.md`
    - package boundaries: `docs/architecture/01-package-boundaries.md`
    - state ownership: `docs/architecture/02-state-and-adapter-ownership.md`
    - styling: `docs/architecture/03-theming-and-styling.md`
    - component contracts: `docs/architecture/09-component-contracts-and-events.md`
    - Custom Elements/forms: `docs/architecture/10-custom-elements-and-form-association.md`
    - current framework support: `docs/metadata/multi-framework.json`
    - active G11-G15 gates: `docs/metadata/multi-framework-program-gates.json`
    - release process: `docs/release/README.md`

    For repository changes, run targeted checks while working and the current root
    validation commands (`npm run check`, `npm run test`, `npm run build`, `npm run ci`)
    as appropriate. Do not mark gates or capabilities complete without required
    evidence.
    ''',
)

write(
    "scripts/verify-component-reference.mjs",
    r'''
    import {
      existsSync,
      readFileSync,
      readdirSync,
    } from "node:fs";
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
          failures.push(`consumer knowledge metadata is missing source ${requiredSource}`);
        }
      }

      const expectedKnowledge = buildConsumerKnowledge({ root });
      const expectedReference = buildComponentReference({ root });
      const expectedAi = buildAiContextArtifacts({ root });
      compareJson(root, knowledgePath, expectedKnowledge, failures, "consumer knowledge");
      compareJson(root, generatedPath, expectedReference, failures, "component reference");
      compareJson(root, `${aiRoot}/index.json`, expectedAi.index, failures, "AI context index");
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
        ...Object.keys(expectedAi.categories).map((id) => `${aiRoot}/categories/${id}.json`),
        ...Object.keys(expectedAi.components).map((id) => `${aiRoot}/components/${id}.json`),
        ...Object.keys(expectedAi.patterns).map((id) => `${aiRoot}/patterns/${id}.json`),
      ]);
      for (const file of filesRecursively(root, aiRoot).filter((entry) => entry.endsWith(".json"))) {
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
        failures.push("component reference must cover every public beta-scope component");
      }
      const frameworkIds = ["react", "native-html", "angular", "vue"];
      for (const component of expectedReference.components ?? []) {
        const source = included.find((entry) => entry.id === component.id);
        for (const frameworkId of frameworkIds) {
          if (!component.frameworks?.[frameworkId]) {
            failures.push(`${component.id}: generated framework usage is missing ${frameworkId}`);
          }
        }
        if (
          source?.frameworkParity?.angular?.status &&
          component.frameworks.angular.status !== source.frameworkParity.angular.status
        ) {
          failures.push(`${component.id}: Angular status must remain sourced from canonical component parity metadata`);
        }
        if (
          source?.frameworkParity?.vue?.status &&
          component.frameworks.vue.status !== source.frameworkParity.vue.status
        ) {
          failures.push(`${component.id}: Vue status must remain sourced from canonical component parity metadata`);
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
        if (!docsPage.includes(marker)) failures.push(`consumer knowledge viewer is missing ${marker}`);
      }
      const aiPage = read(root, "apps/docs/src/AiContextIndexPage.tsx");
      for (const marker of ["ai-context/index.json", "Task-scoped retrieval", "components"]) {
        if (!aiPage.includes(marker)) failures.push(`AI context index viewer is missing ${marker}`);
      }
      const playgroundPage = read(root, "examples/basic-playground/src/components/ComponentDemoPage.tsx");
      for (const marker of ["consumer-knowledge.json", "framework-usage", "canonicalKnowledge"]) {
        if (!playgroundPage.includes(marker)) failures.push(`playground component reference is missing ${marker}`);
      }
      for (const file of filesRecursively(root, "examples/basic-playground/src/pages/reference").filter((entry) => entry.endsWith(".tsx"))) {
        if (/\bstatus="(?:stable|beta-stable|alpha-stable|experimental|planned|deprecated)"/.test(read(root, file))) {
          failures.push(`${file}: component maturity must come from generated consumer knowledge, not a hand-written status prop`);
        }
      }
      const routes = read(root, "examples/basic-playground/src/app/routes.ts");
      for (const marker of [
        'visibility?: "public" | "internal"',
        'group: "Internal"',
        'group: "Advanced Modules"',
        "consumer-knowledge.json",
      ]) {
        if (!routes.includes(marker)) failures.push(`playground routes are missing ${marker}`);
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
          failures.push(`${file}: retired rollout/task language remains in the current consumer knowledge pipeline`);
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
    ''',
)

write(
    "scripts/verify-component-reference.test.mjs",
    r'''
    import assert from "node:assert/strict";
    import {
      cpSync,
      mkdtempSync,
      readFileSync,
      rmSync,
      unlinkSync,
      writeFileSync,
    } from "node:fs";
    import { tmpdir } from "node:os";
    import path from "node:path";
    import test from "node:test";
    import { fileURLToPath } from "node:url";
    import { verifyComponentReference } from "./verify-component-reference.mjs";

    const repositoryRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
    );

    function fixture(mutator, callback) {
      const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-consumer-knowledge-"));
      try {
        for (const entry of ["apps", "docs", "examples", "packages", "scripts"]) {
          cpSync(path.join(repositoryRoot, entry), path.join(root, entry), { recursive: true });
        }
        mutator?.(root);
        callback(verifyComponentReference({ root }));
      } finally {
        rmSync(root, { force: true, recursive: true });
      }
    }

    test("accepts the generated consumer knowledge and task-scoped AI context", () =>
      fixture(null, (failures) => assert.deepEqual(failures, [])));

    test("rejects stale generated consumer knowledge", () =>
      fixture(
        (root) => {
          const file = path.join(root, "docs/generated/consumer-knowledge.json");
          const value = JSON.parse(readFileSync(file, "utf8"));
          value.components.pop();
          writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
        },
        (failures) => assert(failures.some((failure) => failure.includes("consumer knowledge is stale"))),
      ));

    test("rejects a missing component context slice", () =>
      fixture(
        (root) => unlinkSync(path.join(root, "docs/generated/ai-context/components/button.json")),
        (failures) => assert(failures.some((failure) => failure.includes("button AI component context is missing"))),
      ));

    test("rejects generated Angular status drift", () =>
      fixture(
        (root) => {
          const file = path.join(root, "docs/generated/component-reference.json");
          const value = JSON.parse(readFileSync(file, "utf8"));
          const component = value.components.find((entry) => entry.frameworks?.angular?.status === "verified-consumer");
          assert(component, "fixture needs a verified Angular consumer component");
          component.frameworks.angular.status = "first-class";
          writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
        },
        (failures) => assert(failures.some((failure) => failure.includes("component reference is stale"))),
      ));

    test("rejects hand-written playground maturity status", () =>
      fixture(
        (root) => {
          const file = path.join(root, "examples/basic-playground/src/pages/reference/PriorityComponentPages.tsx");
          const content = readFileSync(file, "utf8");
          writeFileSync(file, content.replace("title=\"Button\"", "status=\"stable\" title=\"Button\""));
        },
        (failures) => assert(failures.some((failure) => failure.includes("hand-written status prop"))),
      ));
    ''',
)

# Update package scripts while keeping existing aliases working.
package_path = ROOT / "package.json"
package_json = json.loads(package_path.read_text(encoding="utf-8"))
scripts = package_json.setdefault("scripts", {})
scripts["generate:consumer-knowledge"] = "node scripts/generate-component-reference.mjs"
scripts["verify:consumer-knowledge"] = "node scripts/verify-component-reference.mjs"
scripts["test:consumer-knowledge"] = "node --test scripts/verify-component-reference.test.mjs"
scripts["query:ai-context"] = "node scripts/query-ai-context.mjs"
package_path.write_text(json.dumps(package_json, indent=2) + "\n", encoding="utf-8")

# Refresh related metadata without rewriting unrelated contracts.
mf_path = ROOT / "docs/metadata/multi-framework.json"
mf = json.loads(mf_path.read_text(encoding="utf-8"))
mf["componentReference"] = {
    "status": "current",
    "metadata": "docs/metadata/component-reference-program.json",
    "generated": "docs/generated/component-reference.json",
}
mf["consumerKnowledge"] = {
    "status": "current",
    "metadata": "docs/metadata/component-reference-program.json",
    "generated": "docs/generated/consumer-knowledge.json",
    "aiContextIndex": "docs/generated/ai-context/index.json",
}
mf_path.write_text(json.dumps(mf, indent=2) + "\n", encoding="utf-8")

packages_path = ROOT / "docs/metadata/packages.json"
packages = json.loads(packages_path.read_text(encoding="utf-8"))
notes = {
    "@vyrnforge/ui-behaviors": "Framework-neutral behavior foundations are current and remain renderer-independent.",
    "@vyrnforge/ui-components": "First-class React renderer over shared VyrnForge foundations. The public package name remains stable through the current beta track.",
    "@vyrnforge/ui-elements": "First-class Native HTML / Custom Elements renderer. Clean packed React, Native HTML, Angular, and Vue consumers verify the shared element contract; Angular and Vue first-class package work remains governed by forward-looking distribution gates.",
}
for package in packages.get("packages", []):
    if package.get("name") in notes:
        package["notes"] = notes[package["name"]]
packages_path.write_text(json.dumps(packages, indent=2) + "\n", encoding="utf-8")

metadata_readme = ROOT / "docs/metadata/README.md"
metadata_text = metadata_readme.read_text(encoding="utf-8")
if "`patterns.json`" not in metadata_text:
    metadata_text = metadata_text.replace(
        "- `components.json` owns the normalized component catalog, public-contract\n  inventory, maturity, and evidence.\n",
        "- `components.json` owns the normalized component catalog, public-contract\n  inventory, maturity, and evidence.\n- `patterns.json` owns reusable application composition patterns and task-routing\n  hints shared by the playground and generated AI context.\n",
    )
metadata_readme.write_text(metadata_text, encoding="utf-8")
