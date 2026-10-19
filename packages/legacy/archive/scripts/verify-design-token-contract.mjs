import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildDesignTokenReference,
  verifyDesignTokenReference,
} from "./generate-design-token-reference.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replace(
    /\r\n?/gu,
    "\n",
  );
}

function customPropertyValue(source, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return (
    new RegExp(`${escaped}\\s*:\\s*([^;]+);`, "u").exec(source)?.[1]?.trim() ??
    null
  );
}

function customPropertyNames(source) {
  return new Set(
    [...source.matchAll(/(--vf-[a-z0-9-]+)\s*:/gu)].map((match) => match[1]),
  );
}

const primitiveMatchers = [
  /^--vf-color-/u,
  /^--vf-(?:font|line-height|letter-spacing)-/u,
  /^--vf-space-/u,
  /^--vf-radius-/u,
  /^--vf-shadow-/u,
];
const compatibilitySourcePattern =
  /^--vf-(?:bg|surface|surface-subtle|surface-raised|text|text-muted|text-strong|border|border-strong|primary|primary-hover|primary-soft|danger|danger-soft|warning|warning-soft|success|success-soft|info|info-soft|focus-ring)$/u;
const compatibilityAliasPattern = /^--vf-(?:z-[a-z-]+|transition-fast)$/u;

export async function loadDesignTokenInputs(root = repositoryRoot) {
  return {
    root,
    reference: await buildDesignTokenReference({ root }),
    tokensCss: read(root, "packages/ui-core/src/styles/tokens.css"),
    themesCss: read(root, "packages/ui-core/src/styles/themes.css"),
    densityCss: read(root, "packages/ui-core/src/styles/density.css"),
    accessibilityCss: read(
      root,
      "packages/ui-core/src/styles/accessibility.css",
    ),
  };
}

export function verifyDesignTokenContract({
  reference,
  tokensCss,
  themesCss,
  densityCss,
  accessibilityCss,
}) {
  const failures = [];
  const semanticNames = reference.categories.flatMap((category) =>
    category.tokens.map((token) => token.name),
  );
  const semanticSet = new Set(semanticNames);
  const declarations = customPropertyNames(tokensCss);

  if (new Set(semanticNames).size !== semanticNames.length) {
    failures.push("semantic token registry contains duplicate token names");
  }
  for (const name of semanticSet) {
    if (!declarations.has(name)) {
      failures.push(
        `${name} is registered by ui-core but missing from tokens.css`,
      );
    }
  }
  for (const name of declarations) {
    const accountedFor =
      semanticSet.has(name) ||
      primitiveMatchers.some((matcher) => matcher.test(name)) ||
      compatibilitySourcePattern.test(name) ||
      compatibilityAliasPattern.test(name);
    if (!accountedFor) {
      failures.push(`${name} is not classified by the ui-core token contract`);
    }
  }

  if (
    reference.sourceOfTruth.authority !==
      "packages/ui-core/src/theme/tokenContract.ts" ||
    reference.sourceOfTruth.implementation !==
      "packages/ui-core/src/styles/tokens.css" ||
    reference.sourceOfTruth.canonical !== false ||
    reference.sourceOfTruth.generated !== true
  ) {
    failures.push(
      "Reference token data must be a generated projection of ui-core authority",
    );
  }

  for (const theme of ["dark", "enterprise", "system"]) {
    if (!themesCss.includes(`[data-theme="${theme}"]`)) {
      failures.push(`themes.css is missing [data-theme="${theme}"]`);
    }
  }
  for (const density of [
    "compact",
    "balanced",
    "spacious",
    "standard",
    "comfortable",
  ]) {
    if (!densityCss.includes(`[data-density="${density}"]`)) {
      failures.push(`density.css is missing density '${density}'`);
    }
  }
  for (const selector of [
    "@media (prefers-reduced-motion: reduce)",
    '[data-motion="reduced"]',
    ".vf-motion-reduced",
  ]) {
    if (!accessibilityCss.includes(selector)) {
      failures.push(`reduced-motion CSS is missing ${selector}`);
    }
  }

  for (const [alias, target] of [
    ["--vf-z-base", "--vf-layer-base"],
    ["--vf-z-sticky", "--vf-layer-sticky"],
    ["--vf-z-dropdown", "--vf-layer-dropdown"],
    ["--vf-z-popover", "--vf-layer-popover"],
    ["--vf-z-tooltip", "--vf-layer-tooltip"],
    ["--vf-z-overlay", "--vf-layer-scrim"],
    ["--vf-z-dialog", "--vf-layer-modal"],
    ["--vf-z-toast", "--vf-layer-toast"],
    ["--vf-transition-fast", "--vf-motion-duration-fast"],
  ]) {
    if (!customPropertyValue(tokensCss, alias)?.includes(`var(${target})`)) {
      failures.push(`${alias} must alias ${target}`);
    }
  }

  return failures;
}

async function run() {
  await verifyDesignTokenReference();
  const failures = verifyDesignTokenContract(await loadDesignTokenInputs());
  if (failures.length > 0) {
    console.error("Design token contract verification failed:");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(
    "Design token contract passed: ui-core owns semantic token identity and runtime values; Reference metadata is generated with no duplicate authority.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await run();
}
