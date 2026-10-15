import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const TOKEN_CONTRACT_PATH = "packages/ui-core/src/theme/tokenContract.ts";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

function customPropertyValue(source, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = new RegExp(`${escaped}\\s*:\\s*([^;]+);`, "u").exec(source);
  return match?.[1]?.trim() ?? null;
}

function customPropertyNames(source) {
  return new Set(
    [...source.matchAll(/(--vf-[a-z0-9-]+)\s*:/gu)].map((match) => match[1]),
  );
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

async function loadTokenContract(root) {
  const sourcePath = path.join(root, TOKEN_CONTRACT_PATH);
  const source = read(root, TOKEN_CONTRACT_PATH);
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

export async function loadDesignTokenInputs(root = repositoryRoot) {
  return {
    root,
    registry: await loadTokenContract(root),
    tokensCss: read(root, "packages/ui-core/src/styles/tokens.css"),
    themesCss: read(root, "packages/ui-core/src/styles/themes.css"),
    densityCss: read(root, "packages/ui-core/src/styles/density.css"),
    accessibilityCss: read(
      root,
      "packages/ui-core/src/styles/accessibility.css",
    ),
    themePresetSource: read(root, "packages/ui-core/src/theme/themePresets.ts"),
  };
}

export function verifyDesignTokenContract({
  registry,
  tokensCss,
  themesCss,
  densityCss,
  accessibilityCss,
  themePresetSource,
}) {
  const failures = [];
  const {
    vyrnForgeCanonicalDensities,
    vyrnForgeCompatibilityAliases,
    vyrnForgeCompatibilityBridges,
    vyrnForgeCompatibilitySourceTokens,
    vyrnForgeDensityAliases,
    vyrnForgeDesignTokenCategories,
    vyrnForgeDesignTokenSource,
    vyrnForgeLayerOrder,
    vyrnForgeMotionContract,
    vyrnForgePrimitiveTokenGroups,
    vyrnForgeSemanticTokenGroups,
    vyrnForgeThemeColorTokens,
    vyrnForgeThemeContract,
  } = registry;

  if (
    vyrnForgeDesignTokenSource?.canonical !== true ||
    vyrnForgeDesignTokenSource?.owner !== "@vyrnforge/ui-core" ||
    vyrnForgeDesignTokenSource?.typedExport !== TOKEN_CONTRACT_PATH
  ) {
    failures.push(
      "ui-core tokenContract.ts must remain the canonical token authority",
    );
  }

  const semanticEntries = Object.entries(vyrnForgeSemanticTokenGroups ?? {});
  const semanticNames = semanticEntries.flatMap(([, tokens]) => tokens);
  const primitiveNames = Object.values(
    vyrnForgePrimitiveTokenGroups ?? {},
  ).flat();
  const aliasNames = (vyrnForgeCompatibilityAliases ?? []).map(
    ({ name }) => name,
  );
  const registeredNames = [
    ...primitiveNames,
    ...(vyrnForgeCompatibilitySourceTokens ?? []),
    ...semanticNames,
    ...aliasNames,
  ];

  const duplicateNames = registeredNames.filter(
    (name, index) => registeredNames.indexOf(name) !== index,
  );
  for (const name of new Set(duplicateNames)) {
    failures.push(`token registry contains duplicate '${name}'`);
  }

  const cssNames = customPropertyNames(tokensCss);
  const registeredSet = new Set(registeredNames);
  for (const name of registeredSet) {
    if (!cssNames.has(name)) {
      failures.push(
        `${name} is registered but missing from ui-core tokens.css`,
      );
    }
  }
  for (const name of cssNames) {
    if (!registeredSet.has(name)) {
      failures.push(
        `${name} exists in ui-core tokens.css but is not registered`,
      );
    }
  }

  const categoryIds = (vyrnForgeDesignTokenCategories ?? []).map(
    (category) => category.id,
  );
  if (categoryIds.join(",") !== semanticEntries.map(([id]) => id).join(",")) {
    failures.push(
      "reader token categories must match semantic token groups in order",
    );
  }
  for (const category of vyrnForgeDesignTokenCategories ?? []) {
    const expected = vyrnForgeSemanticTokenGroups?.[category.id] ?? [];
    const actual = category.tokens?.map(({ name }) => name) ?? [];
    if (actual.join(",") !== expected.join(",")) {
      failures.push(
        `reader token category '${category.id}' drifted from its semantic group`,
      );
    }
  }

  const themeScoped = new Set(vyrnForgeThemeColorTokens ?? []);
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
    if (keys.size === 0) failures.push(`${theme} theme preset is missing`);
  }

  for (const theme of vyrnForgeThemeContract?.required ?? []) {
    if (theme === "light") continue;
    const selector = `[data-theme="${theme}"]`;
    if (!themesCss.includes(selector)) {
      failures.push(`themes.css is missing ${selector}`);
    }
  }

  if (
    (vyrnForgeCanonicalDensities ?? []).join(",") !==
    "compact,balanced,spacious"
  ) {
    failures.push(
      "canonical densities must be compact, balanced, and spacious in that order",
    );
  } else {
    for (const density of vyrnForgeCanonicalDensities) {
      if (
        !densityCss.includes(`[data-density="${density}"]`) ||
        !densityCss.includes(`.vf-density-${density}`)
      ) {
        failures.push(`density.css is missing canonical density '${density}'`);
      }
    }
  }

  for (const [alias, canonical] of Object.entries(
    vyrnForgeDensityAliases ?? {},
  )) {
    if (
      !vyrnForgeCanonicalDensities?.includes(canonical) ||
      !densityCss.includes(`[data-density="${alias}"]`) ||
      !densityCss.includes(`.vf-density-${alias}`)
    ) {
      failures.push(
        `density alias '${alias}' must map to declared canonical density '${canonical}'`,
      );
    }
  }

  for (const bridge of vyrnForgeCompatibilityBridges ?? []) {
    if (
      !registeredSet.has(bridge.legacy) ||
      !registeredSet.has(bridge.canonical)
    ) {
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

  for (const alias of vyrnForgeCompatibilityAliases ?? []) {
    const value = customPropertyValue(tokensCss, alias.name);
    if (!value?.includes(`var(${alias.target})`)) {
      failures.push(`${alias.name} must alias ${alias.target}`);
    }
  }

  const layerLevels = (vyrnForgeLayerOrder ?? []).map(({ level }) => level);
  if (
    layerLevels.length === 0 ||
    new Set(layerLevels).size !== layerLevels.length ||
    layerLevels.some(
      (level, index) => index > 0 && level <= layerLevels[index - 1],
    )
  ) {
    failures.push("layer levels must be unique and strictly increasing");
  }
  for (const layer of vyrnForgeLayerOrder ?? []) {
    if (!registeredSet.has(layer.name)) {
      failures.push(`layer contract references unknown token ${layer.name}`);
      continue;
    }
    if (customPropertyValue(tokensCss, layer.name) !== String(layer.level)) {
      failures.push(`${layer.name} must equal documented level ${layer.level}`);
    }
  }

  for (const selector of vyrnForgeMotionContract?.explicitReducedSelectors ??
    []) {
    if (!accessibilityCss.includes(selector)) {
      failures.push(`reduced-motion CSS is missing selector ${selector}`);
    }
  }
  if (
    !accessibilityCss.includes(
      `@media ${vyrnForgeMotionContract?.automaticMediaQuery}`,
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

async function run() {
  const failures = verifyDesignTokenContract(await loadDesignTokenInputs());

  if (failures.length > 0) {
    console.error("Design token contract verification failed:");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log(
    "Design token contract passed: ui-core owns the complete primitive, compatibility, semantic, theme, density, motion, and layer registry.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await run();
}
