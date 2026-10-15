import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const DESIGN_TOKEN_REFERENCE_PATH = "docs/metadata/design-tokens.json";
const TOKEN_CONTRACT_PATH = "packages/ui-core/src/theme/tokenContract.ts";

async function loadTokenContract(root) {
  const sourcePath = path.join(root, TOKEN_CONTRACT_PATH);
  const source = readFileSync(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
  }).outputText;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
  return import(dataUrl);
}

export async function buildDesignTokenReference({ root = repositoryRoot } = {}) {
  const contract = await loadTokenContract(root);

  return {
    schemaVersion: 1,
    sourceOfTruth: {
      ...contract.vyrnForgeDesignTokenSource,
      canonical: false,
      generated: true,
      authority: TOKEN_CONTRACT_PATH,
      gate: "G3",
      gateState: "evidence-complete",
      closureTask: "VF-3012",
    },
    categories: contract.vyrnForgeDesignTokenCategories,
    primitives: contract.vyrnForgePrimitiveTokenGroups,
    themes: {
      ...contract.vyrnForgeThemeContract,
      themeScopedTokens: "vyrnForgeThemeColorTokens",
    },
    densities: {
      canonical: contract.vyrnForgeCanonicalDensities,
      compatibilityAliases: contract.vyrnForgeDensityAliases,
      policy:
        "Balanced is the default. Standard and comfortable remain supported until consuming package APIs migrate.",
    },
    motion: contract.vyrnForgeMotionContract,
    layers: contract.vyrnForgeLayerOrder,
    compatibilitySourceTokens: contract.vyrnForgeCompatibilitySourceTokens,
    compatibilityBridges: contract.vyrnForgeCompatibilityBridges.map((bridge) => ({
      ...bridge,
      direction: "canonical-reads-legacy",
    })),
    compatibilityAliases: contract.vyrnForgeCompatibilityAliases,
    ownershipPolicy: {
      shared:
        "Shared semantic decisions use --vf-* and are owned by @vyrnforge/ui-core.",
      primitive:
        "Primitive palette, spacing, radius, shadow, and type-scale tokens are implementation ingredients; application UI should prefer semantic roles.",
      componentLocal:
        "Component-local variables may describe measured geometry or private composition, but must not redefine shared semantic color, focus, status, density, typography, motion, or layer roles.",
      gridLocal:
        "Grid-only behavior uses --udg-* and should map shared decisions to canonical --vf-* roles.",
      applicationLocal:
        "Docs and consuming apps may use scoped presentation classes and overrides, but they do not own VyrnForge token truth.",
    },
    evidence: {
      foundation: "docs/quality/s3-semantic-token-audit.md",
      adoption: "docs/quality/s3-token-adoption-report.md",
      visualRegression: "docs/metadata/visual-regression-matrix.json",
      closure: "docs/metadata/g3-closure.json",
    },
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
  const actual = readFileSync(outputPath, "utf8").replace(/\r\n?/gu, "\n");
  const expected = serializeDesignTokenReference(
    await buildDesignTokenReference({ root }),
  ).replace(/\r\n?/gu, "\n");
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
