import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredCategoryIds = [
  "surface",
  "text",
  "border",
  "interactive",
  "status",
  "density",
  "typography",
  "motion",
  "layer",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function customPropertyValue(source, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = new RegExp(`${escaped}\\s*:\\s*([^;]+);`, "u").exec(source);
  return match?.[1]?.trim() ?? null;
}

function extractObjectKeys(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`);
  if (start < 0) return new Set();

  const open = source.indexOf("{", start);
  const close = source.indexOf("};", open);
  if (open < 0 || close < 0) return new Set();

  return new Set(
    [...source.slice(open, close).matchAll(/"(--vf-[a-z0-9-]+)"\s*:/gu)].map(
      (match) => match[1],
    ),
  );
}

function isTokenName(value) {
  return (
    typeof value === "string" && /^--vf-[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)
  );
}

export function loadDesignTokenInputs(root = repositoryRoot) {
  return {
    root,
    contract: readJson(root, "docs/metadata/design-tokens.json"),
    tokensCss: read(root, "packages/ui-core/src/styles/tokens.css"),
    themesCss: read(root, "packages/ui-core/src/styles/themes.css"),
    densityCss: read(root, "packages/ui-core/src/styles/density.css"),
    accessibilityCss: read(
      root,
      "packages/ui-core/src/styles/accessibility.css",
    ),
    tokenContractSource: read(
      root,
      "packages/ui-core/src/theme/tokenContract.ts",
    ),
    themePresetSource: read(root, "packages/ui-core/src/theme/themePresets.ts"),
  };
}

export function verifyDesignTokenContract({
  contract,
  tokensCss,
  themesCss,
  densityCss,
  accessibilityCss,
  tokenContractSource,
  themePresetSource,
}) {
  const failures = [];

  if (
    contract?.schemaVersion !== 1 ||
    contract?.sourceOfTruth?.canonical !== true ||
    contract?.sourceOfTruth?.owner !== "@vyrnforge/ui-core"
  ) {
    return [
      "design-tokens.json must use canonical schema version 1 owned by @vyrnforge/ui-core",
    ];
  }

  if (!Array.isArray(contract.categories)) {
    return ["design-tokens.json categories are required"];
  }

  const categoryIds = new Set(
    contract.categories.map((category) => category.id),
  );
  for (const categoryId of requiredCategoryIds) {
    if (!categoryIds.has(categoryId)) {
      failures.push(`missing required token category '${categoryId}'`);
    }
  }

  const names = new Set();
  const themeScoped = new Set();

  for (const category of contract.categories) {
    if (
      !Array.isArray(category.tokens) ||
      category.tokens.length === 0 ||
      typeof category.task !== "string" ||
      !/^VF-300[1-8]$/u.test(category.task)
    ) {
      failures.push(
        `category '${category.id}' needs a VF-3001 through VF-3008 task and tokens`,
      );
      continue;
    }

    for (const token of category.tokens) {
      if (!isTokenName(token?.name)) {
        failures.push(
          `category '${category.id}' contains an invalid token name`,
        );
        continue;
      }
      if (names.has(token.name)) {
        failures.push(`duplicate canonical token '${token.name}'`);
      }
      names.add(token.name);

      if (!customPropertyValue(tokensCss, token.name)) {
        failures.push(`${token.name} is missing from ui-core tokens.css`);
      }
      if (!tokenContractSource.includes(`"${token.name}"`)) {
        failures.push(`${token.name} is missing from the typed token contract`);
      }
      if (token.themeScoped === true) {
        themeScoped.add(token.name);
      }
    }
  }

  const themeExports = {
    light: "vyrnForgeLightTheme",
    dark: "vyrnForgeDarkTheme",
    enterprise: "vyrnForgeEnterpriseTheme",
  };

  for (const [theme, exportName] of Object.entries(themeExports)) {
    const keys = extractObjectKeys(themePresetSource, exportName);
    for (const token of themeScoped) {
      if (!keys.has(token)) {
        failures.push(`${exportName} is missing theme-scoped token ${token}`);
      }
    }
    if (keys.size === 0) {
      failures.push(`${theme} theme preset is missing`);
    }
  }

  for (const themeSelector of [
    '[data-theme="dark"]',
    '[data-theme="enterprise"]',
    '[data-theme="system"]',
  ]) {
    if (!themesCss.includes(themeSelector)) {
      failures.push(`themes.css is missing ${themeSelector}`);
    }
  }

  const canonicalDensities = contract?.densities?.canonical;
  if (
    !Array.isArray(canonicalDensities) ||
    canonicalDensities.join(",") !== "compact,balanced,spacious"
  ) {
    failures.push(
      "canonical densities must be compact, balanced, and spacious in that order",
    );
  } else {
    for (const density of canonicalDensities) {
      if (
        !densityCss.includes(`[data-density="${density}"]`) ||
        !densityCss.includes(`.vf-density-${density}`)
      ) {
        failures.push(`density.css is missing canonical density '${density}'`);
      }
    }
  }

  for (const [alias, canonical] of Object.entries(
    contract?.densities?.compatibilityAliases ?? {},
  )) {
    if (
      !canonicalDensities?.includes(canonical) ||
      !densityCss.includes(`[data-density="${alias}"]`) ||
      !densityCss.includes(`.vf-density-${alias}`)
    ) {
      failures.push(
        `density alias '${alias}' must map to declared canonical density '${canonical}'`,
      );
    }
  }

  for (const bridge of contract.compatibilityBridges ?? []) {
    if (!isTokenName(bridge.legacy) || !names.has(bridge.canonical)) {
      failures.push("compatibility bridge references an unknown token");
      continue;
    }

    const canonicalValue = customPropertyValue(tokensCss, bridge.canonical);
    if (!canonicalValue?.includes(`var(${bridge.legacy})`)) {
      failures.push(
        `${bridge.canonical} must preserve compatibility through ${bridge.legacy}`,
      );
    }
  }

  for (const alias of contract.compatibilityAliases ?? []) {
    const value = customPropertyValue(tokensCss, alias.name);
    if (!value?.includes(`var(${alias.target})`)) {
      failures.push(`${alias.name} must alias ${alias.target}`);
    }
  }

  const layerLevels = contract.layers?.map((layer) => layer.level) ?? [];
  if (
    layerLevels.length === 0 ||
    new Set(layerLevels).size !== layerLevels.length ||
    layerLevels.some(
      (level, index) => index > 0 && level <= layerLevels[index - 1],
    )
  ) {
    failures.push("layer levels must be unique and strictly increasing");
  }

  for (const layer of contract.layers ?? []) {
    if (!names.has(layer.name)) {
      failures.push(`layer contract references unknown token ${layer.name}`);
      continue;
    }

    if (customPropertyValue(tokensCss, layer.name) !== String(layer.level)) {
      failures.push(`${layer.name} must equal documented level ${layer.level}`);
    }
  }

  for (const selector of contract?.motion?.explicitReducedSelectors ?? []) {
    if (!accessibilityCss.includes(selector)) {
      failures.push(`reduced-motion CSS is missing selector ${selector}`);
    }
  }
  if (
    !accessibilityCss.includes(
      `@media ${contract?.motion?.automaticMediaQuery}`,
    )
  ) {
    failures.push("automatic reduced-motion media query is missing");
  }
  for (const token of [
    "--vf-motion-duration-fast",
    "--vf-motion-duration-standard",
    "--vf-motion-duration-slow",
    "--vf-motion-duration-deliberate",
  ]) {
    if (!accessibilityCss.includes(`${token}: 1ms`)) {
      failures.push(`reduced-motion fallback must shorten ${token}`);
    }
  }

  return failures;
}

function run() {
  const failures = verifyDesignTokenContract(loadDesignTokenInputs());

  if (failures.length > 0) {
    console.error("Design token contract verification failed:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    "Design token contract passed: 9 categories, complete theme presets, canonical density aliases, reduced motion, and deterministic layers.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
