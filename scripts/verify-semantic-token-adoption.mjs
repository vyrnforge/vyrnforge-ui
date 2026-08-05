import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const legacySharedTokens = new Set([
  "--vf-bg",
  "--vf-surface",
  "--vf-surface-raised",
  "--vf-surface-subtle",
  "--vf-text",
  "--vf-text-muted",
  "--vf-text-strong",
  "--vf-border",
  "--vf-border-strong",
  "--vf-primary",
  "--vf-primary-hover",
  "--vf-primary-soft",
  "--vf-danger",
  "--vf-danger-soft",
  "--vf-warning",
  "--vf-warning-soft",
  "--vf-success",
  "--vf-success-soft",
  "--vf-info",
  "--vf-info-soft",
  "--vf-focus-ring",
  "--vf-transition-fast",
]);

const requiredGridMappings = {
  "--udg-bg": "--vf-surface-page",
  "--udg-surface": "--vf-surface-default",
  "--udg-popover-bg": "--vf-surface-overlay",
  "--udg-text": "--vf-text-primary",
  "--udg-border": "--vf-border-default",
  "--udg-primary": "--vf-interactive-primary",
  "--udg-primary-soft": "--vf-interactive-selected-background",
  "--udg-danger": "--vf-status-error-text",
  "--udg-warning": "--vf-status-warning-text",
  "--udg-success": "--vf-status-success-text",
  "--udg-info": "--vf-status-info-text",
  "--udg-control-bg": "--vf-control-background",
  "--udg-row-hover-bg": "--vf-interactive-neutral-hover",
  "--udg-row-selected-bg": "--vf-interactive-selected-background",
  "--udg-row-border": "--vf-divider",
};

function normalize(source) {
  return source.replaceAll("\r\n", "\n");
}

function read(root, relativePath) {
  return normalize(readFileSync(path.join(root, relativePath), "utf8"));
}

function listCssFiles(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  const files = [];

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (entry.name.endsWith(".css")) {
        files.push({
          path: path.relative(root, absolutePath).replaceAll("\\", "/"),
          source: normalize(readFileSync(absolutePath, "utf8")),
        });
      }
    }
  }

  visit(absoluteDirectory);
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function withoutComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//gu, "");
}

function referencedVariables(source) {
  return [...source.matchAll(/var\((--[a-z0-9-]+)/gu)].map((match) => match[1]);
}

function findLiteralColors(source) {
  return (
    withoutComments(source).match(/#[0-9a-f]{3,8}|rgba?\([^)]*\)/giu) ?? []
  );
}

function findLiteralDurations(source) {
  return (
    withoutComments(source).match(
      /(?:transition|animation)[^;{}]*\b\d+(?:\.\d+)?m?s\b[^;{}]*;/giu,
    ) ?? []
  );
}

export function loadSemanticTokenAdoptionInputs(root = repositoryRoot) {
  return {
    root,
    componentCssFiles: listCssFiles(root, "packages/ui-components/src/styles"),
    gridCssFiles: listCssFiles(root, "packages/ui-data-grid/src/styles"),
    gridTokensCss: read(
      root,
      "packages/ui-data-grid/src/styles/tokens/data-grid.tokens.css",
    ),
    gridThemesCss: read(
      root,
      "packages/ui-data-grid/src/styles/tokens/data-grid.themes.css",
    ),
    gridThemeSource: read(
      root,
      "packages/ui-data-grid/src/theme/dataGridThemes.ts",
    ),
  };
}

export function verifySemanticTokenAdoption({
  componentCssFiles,
  gridCssFiles,
  gridTokensCss,
  gridThemesCss,
  gridThemeSource,
}) {
  const failures = [];

  for (const file of [...componentCssFiles, ...gridCssFiles]) {
    const legacyReferences = [
      ...new Set(
        referencedVariables(file.source).filter((token) =>
          legacySharedTokens.has(token),
        ),
      ),
    ];
    for (const token of legacyReferences) {
      failures.push(`${file.path} references legacy shared token ${token}`);
    }

    for (const duration of findLiteralDurations(file.source)) {
      failures.push(
        `${file.path} contains literal motion timing '${duration}'`,
      );
    }
  }

  for (const file of componentCssFiles) {
    for (const color of findLiteralColors(file.source)) {
      failures.push(`${file.path} contains hard-coded color ${color}`);
    }
  }

  for (const file of gridCssFiles) {
    if (file.path.endsWith("tokens/data-grid.themes.css")) {
      continue;
    }
    for (const color of findLiteralColors(file.source)) {
      failures.push(`${file.path} contains hard-coded color ${color}`);
    }
  }

  if (!gridThemesCss.includes('[data-theme="high-contrast"]')) {
    failures.push(
      "data-grid.themes.css must preserve the documented high-contrast exception",
    );
  }

  for (const selector of ["light", "dark", "enterprise", "system"]) {
    const blocks = [
      ...gridThemesCss.matchAll(
        new RegExp(
          `\\.udg\\[data-theme="${selector}"\\]\\s*\\{([\\s\\S]*?)\\}`,
          "gu",
        ),
      ),
    ].map((match) => match[1]);

    if (blocks.some((block) => block.includes("--udg-"))) {
      failures.push(
        `data-grid theme '${selector}' must inherit shared semantic mappings instead of redefining --udg-* colors`,
      );
    }
  }

  for (const [gridToken, sharedToken] of Object.entries(requiredGridMappings)) {
    const escapedGrid = gridToken.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const escapedShared = sharedToken.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const mapping = new RegExp(
      `${escapedGrid}\\s*:\\s*var\\(${escapedShared}\\)\\s*;`,
      "u",
    );
    if (!mapping.test(gridTokensCss)) {
      failures.push(`${gridToken} must map to ${sharedToken}`);
    }
  }

  if (
    !gridTokensCss.includes("--udg-surface-ra-sm: var(--udg-surface-raised)")
  ) {
    failures.push(
      "the historical --udg-surface-ra-sm alias must remain bridged",
    );
  }

  if (
    !gridThemeSource.includes("vyrnForgeLightTheme") ||
    !gridThemeSource.includes("vyrnForgeDarkTheme") ||
    !gridThemeSource.includes("vyrnForgeEnterpriseTheme")
  ) {
    failures.push(
      "typed data-grid presets must derive from ui-core theme presets",
    );
  }

  if (findLiteralColors(gridThemeSource).length > 0) {
    failures.push(
      "typed data-grid presets must not duplicate hard-coded theme colors",
    );
  }

  const componentSource = componentCssFiles
    .map((file) => file.source)
    .join("\n");
  for (const categoryPrefix of [
    "--vf-surface-",
    "--vf-text-",
    "--vf-border-",
    "--vf-interactive-",
    "--vf-status-",
    "--vf-control-",
    "--vf-type-",
    "--vf-motion-",
    "--vf-layer-",
  ]) {
    if (!componentSource.includes(categoryPrefix)) {
      failures.push(
        `ui-components must adopt ${categoryPrefix} semantic roles`,
      );
    }
  }

  return failures;
}

function run() {
  const failures = verifySemanticTokenAdoption(
    loadSemanticTokenAdoptionInputs(),
  );

  if (failures.length > 0) {
    console.error("Semantic token adoption verification failed:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    "Semantic token adoption passed: ui-components uses shared semantic roles and ui-data-grid retains only documented grid mappings and the high-contrast exception.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
