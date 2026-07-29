import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const checkOnly = process.argv.includes("--check");
const registryPath = path.join(
  repositoryRoot,
  "packages/ui-elements/src/registry.ts",
);
const componentMetadataPath = path.join(
  repositoryRoot,
  "docs/metadata/components.json",
);
const eventsPath = path.join(
  repositoryRoot,
  "packages/ui-elements/src/events.ts",
);
const outputPath = path.join(
  repositoryRoot,
  "packages/ui-elements/custom-elements.json",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function collectDefinitions(registryText) {
  const definitions = [];
  const pattern = /tagName:\s*"([^"]+)"\s*,\s*constructor:\s*([A-Za-z0-9_]+)/gs;

  for (const match of registryText.matchAll(pattern)) {
    definitions.push({ tagName: match[1], className: match[2] });
  }

  return definitions;
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, "\n");
}

function collectCanonicalEvents(eventsText) {
  const detailMap = eventsText.match(
    /export interface VyrnForgeCanonicalEventDetailMap\s*\{([\s\S]*?)\n\}/,
  );
  assert(detailMap, "VyrnForgeCanonicalEventDetailMap is missing.");

  return [...detailMap[1].matchAll(/readonly\s+"([^"]+)"\s*:/g)].map(
    (match) => match[1],
  );
}

function componentDescriptions(metadata) {
  const descriptions = new Map();

  for (const component of metadata.components ?? []) {
    const native = component.frameworkParity?.native;
    const target = native?.target;
    if (
      native?.status !== "current" ||
      native?.strategy !== "direct-element" ||
      typeof target !== "string" ||
      !target.startsWith("vf-") ||
      descriptions.has(target)
    ) {
      continue;
    }

    descriptions.set(
      target,
      [
        component.displayName
          ? `${component.displayName} browser-native renderer.`
          : undefined,
        component.purpose,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  return descriptions;
}

function createManifest(definitions, descriptions, canonicalEvents) {
  return {
    schemaVersion: "1.0.0",
    readme: "README.md",
    modules: [
      {
        kind: "javascript-module",
        path: "dist/index.js",
        declarations: definitions.map(({ tagName, className }) => ({
          kind: "class",
          name: className,
          description:
            descriptions.get(tagName) ??
            `VyrnForge ${tagName} browser-native renderer.`,
          tagName,
          customElement: true,
          superclass: {
            name: "HTMLElement",
            package: "global",
          },
        })),
      },
    ],
    vyrnforge: {
      namespace: "vf-",
      registration: {
        explicitEntryPoint: "@vyrnforge/ui-elements/register",
        registerAll: "registerVyrnForgeElements",
        packageRootSideEffects: false,
      },
      domMode: "light-dom",
      registeredTagCount: definitions.length,
      eventVocabulary: canonicalEvents,
      typeDeclarations: {
        tagNameMap: "VyrnForgeHTMLElementTagNameMap",
        globalDomMap: "HTMLElementTagNameMap",
        eventDetailMap: "VyrnForgeCanonicalEventDetailMap",
      },
    },
  };
}

const registryText = readFileSync(registryPath, "utf8");
const definitions = collectDefinitions(registryText);
assert(
  definitions.length === 58,
  `Expected 58 registered elements, received ${definitions.length}.`,
);
assert(
  new Set(definitions.map((item) => item.tagName)).size === definitions.length,
  "Custom Element registry contains duplicate tags.",
);
assert(
  new Set(definitions.map((item) => item.className)).size ===
    definitions.length,
  "Custom Element registry contains duplicate constructor exports.",
);

const eventsText = readFileSync(eventsPath, "utf8");
const canonicalEvents = collectCanonicalEvents(eventsText);
assert(canonicalEvents.length > 0, "Canonical event map is empty.");
assert(
  new Set(canonicalEvents).size === canonicalEvents.length,
  "Canonical event map contains duplicate names.",
);
for (const eventName of canonicalEvents) {
  assert(
    /^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(eventName),
    `Invalid canonical event name: ${eventName}.`,
  );
}

const metadata = readJson(componentMetadataPath);
const manifest = createManifest(
  definitions,
  componentDescriptions(metadata),
  canonicalEvents,
);
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

if (checkOnly) {
  assert(existsSync(outputPath), "custom-elements.json is missing.");
  assert(
    normalizeLineEndings(readFileSync(outputPath, "utf8")) === serialized,
    "custom-elements.json is stale; run npm run generate:custom-elements.",
  );
  console.log(
    `Custom Elements metadata is current for ${definitions.length} vf-* tags.`,
  );
} else {
  writeFileSync(outputPath, serialized);
  console.log(
    `Generated Custom Elements metadata for ${definitions.length} vf-* tags.`,
  );
}
