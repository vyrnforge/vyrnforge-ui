import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildVueCatalogArtifact } from "./vue-catalog-generation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifact = buildVueCatalogArtifact({ root });
const outputPath = path.join(root, artifact.path);

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
if (
  !indexSource.includes('export * from "./generated/catalog.generated";')
) {
  throw new Error("Vue public entrypoint does not export the generated catalog");
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
