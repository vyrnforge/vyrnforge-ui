import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import { loadPublicNonGridBetaComponentIds } from "./non-grid-component-scope.mjs";
import { buildVueCatalogArtifact } from "./vue-catalog-generation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifact = buildVueCatalogArtifact({ root });
const contracts = loadCanonicalComponentContracts({ root });
const publicComponentIds = new Set(loadPublicNonGridBetaComponentIds({ root }));
const outputPath = path.join(root, artifact.path);

const stagedPublicMappings = contracts.components
  .filter(
    (component) =>
      publicComponentIds.has(component.id) &&
      component.frameworkMappings.vue.implementationState !== "current",
  )
  .map((component) => component.id);
if (stagedPublicMappings.length > 0) {
  throw new Error(
    `Vue public catalog mappings must be current: ${stagedPublicMappings.join(", ")}`,
  );
}

if (!existsSync(outputPath)) {
  throw new Error(`${artifact.path} is missing`);
}
const actual = readFileSync(outputPath, "utf8").replace(/\r\n?/g, "\n");
const expected = artifact.content.replace(/\r\n?/g, "\n");
if (actual !== expected) {
  throw new Error(
    `${artifact.path} is stale; run npm run generate:framework-artifacts`,
  );
}

const indexSource = readFileSync(
  path.join(root, "packages/ui-vue/src/index.ts"),
  "utf8",
);
if (!indexSource.includes("./generated/typed-catalog.generated")) {
  throw new Error(
    "Vue public entrypoint does not export the generated typed catalog",
  );
}
const typedCatalogSource = readFileSync(
  path.join(root, "packages/ui-vue/src/generated/typed-catalog.generated.ts"),
  "utf8",
);
if (!typedCatalogSource.includes("./catalog.generated")) {
  throw new Error(
    "Vue typed catalog does not delegate runtime ownership to the generated catalog",
  );
}
const pluginSource = readFileSync(
  path.join(root, "packages/ui-vue/src/plugin.ts"),
  "utf8",
);
if (!pluginSource.includes("vyrnForgeVueGeneratedComponents")) {
  throw new Error("Vue plugin does not register the generated catalog");
}

console.log(
  `Vue catalog coverage verified for ${artifact.components.length} supported non-grid contracts.`,
);
