import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const DESIGN_TOKEN_REFERENCE_PATH =
  "docs/generated/design-token-reference.json";
const TOKEN_CONTRACT_PATH = "packages/ui-core/src/theme/tokenContract.ts";
const TOKEN_CSS_PATH = "packages/ui-core/src/styles/tokens.css";

const categoryDefinitions = {
  surface: {
    task: "VF-3002",
    purpose: "Page, canvas, component, overlay, sunken, and scrim surfaces.",
  },
  text: {
    task: "VF-3002",
    purpose: "Primary, secondary, tertiary, inverse, disabled, and link text.",
  },
  border: {
    task: "VF-3002",
    purpose: "Subtle, default, emphasis, and divider boundaries.",
  },
  interactive: {
    task: "VF-3003",
    purpose: "Hover, active, selected, disabled, control, and focus behavior.",
  },
  status: {
    task: "VF-3004",
    purpose: "Success, warning, error, info, pending, and neutral feedback roles.",
  },
  density: {
    task: "VF-3005",
    purpose:
      "Control sizes, padding, icons, row heights, hit targets, and active density values.",
  },
  typography: {
    task: "VF-3006",
    purpose: "Display, title, label, body, caption, code, and numeric hierarchy.",
  },
  motion: {
    task: "VF-3007",
    purpose: "Durations, easing, transitions, and reduced-motion behavior.",
  },
  layer: {
    task: "VF-3008",
    purpose:
      "Deterministic base, raised, sticky, overlay, modal, toast, and debug layers.",
  },
};

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replace(/\r\n?/gu, "\n");
}

async function loadTokenContract(root) {
  const sourcePath = path.join(root, TOKEN_CONTRACT_PATH);
  const output = ts.transpileModule(read(root, TOKEN_CONTRACT_PATH), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: sourcePath,
  }).outputText;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
  return import(dataUrl);
}

function tokenPurpose(name) {
  const words = name.replace(/^--vf-/u, "").replace(/-/gu, " ");
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}.`;
}

function primitiveGroups(tokensCss) {
  const names = [...tokensCss.matchAll(/(--vf-[a-z0-9-]+)\s*:/gu)].map(
    (match) => match[1],
  );
  const matchers = {
    color: /^--vf-color-/u,
    typography: /^--vf-(?:font|line-height|letter-spacing)-/u,
    spacing: /^--vf-space-/u,
    radius: /^--vf-radius-/u,
    shadow: /^--vf-shadow-/u,
  };
  return Object.fromEntries(
    Object.entries(matchers).map(([id, matcher]) => [
      id,
      names.filter((name) => matcher.test(name)),
    ]),
  );
}

export async function buildDesignTokenReference({ root = repositoryRoot } = {}) {
  const contract = await loadTokenContract(root);
  const tokensCss = read(root, TOKEN_CSS_PATH);
  const themeScoped = new Set(contract.vyrnForgeThemeColorTokens);
  const categories = Object.entries(contract.vyrnForgeSemanticTokenGroups).map(
    ([id, names]) => {
      const definition = categoryDefinitions[id];
      if (!definition) throw new Error(`Missing token category definition: ${id}`);
      return {
        id,
        task: definition.task,
        sourceFile: TOKEN_CSS_PATH,
        purpose: definition.purpose,
        tokens: names.map((name) => ({
          name,
          purpose: tokenPurpose(name),
          themeScoped: themeScoped.has(name),
        })),
      };
    },
  );

  return {
    schemaVersion: 1,
    sourceOfTruth: {
      canonical: false,
      generated: true,
      owner: "@vyrnforge/ui-core",
      authority: TOKEN_CONTRACT_PATH,
      implementation: TOKEN_CSS_PATH,
      typedExport: TOKEN_CONTRACT_PATH,
    },
    categories,
    primitives: primitiveGroups(tokensCss),
  };
}

export function serializeDesignTokenReference(reference) {
  return `${JSON.stringify(reference, null, 2)}\n`;
}

export async function writeDesignTokenReference({ root = repositoryRoot } = {}) {
  const reference = await buildDesignTokenReference({ root });
  writeFileSync(
    path.join(root, DESIGN_TOKEN_REFERENCE_PATH),
    serializeDesignTokenReference(reference),
    "utf8",
  );
  return reference;
}

export async function verifyDesignTokenReference({ root = repositoryRoot } = {}) {
  const outputPath = path.join(root, DESIGN_TOKEN_REFERENCE_PATH);
  if (!existsSync(outputPath)) {
    throw new Error(
      `${DESIGN_TOKEN_REFERENCE_PATH} is missing; run node scripts/generate-design-token-reference.mjs.`,
    );
  }
  const actual = read(root, DESIGN_TOKEN_REFERENCE_PATH);
  const expected = serializeDesignTokenReference(
    await buildDesignTokenReference({ root }),
  );
  if (actual !== expected) {
    throw new Error(
      `${DESIGN_TOKEN_REFERENCE_PATH} is stale; run node scripts/generate-design-token-reference.mjs.`,
    );
  }
  return JSON.parse(actual);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes("--check");
  const reference = checkOnly
    ? await verifyDesignTokenReference()
    : await writeDesignTokenReference();
  console.log(
    `${DESIGN_TOKEN_REFERENCE_PATH} ${checkOnly ? "is current" : "generated"} from ${reference.categories.length} ui-core semantic token categories.`,
  );
}
