import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import prettier from "prettier";

const files = [
  "docs/api/ui-components-api.md",
  "scripts/verify-markdown-structure.mjs",
  "scripts/verify-markdown-structure.test.mjs",
];

for (const relativePath of files) {
  const source = readFileSync(relativePath, "utf8");
  const formatted = await prettier.format(source, { filepath: relativePath });
  if (formatted === source) continue;

  const target = path.join(
    tmpdir(),
    `vyrnforge-prettier-${path.basename(relativePath)}`,
  );
  writeFileSync(target, formatted);

  const result = spawnSync(
    "git",
    ["diff", "--no-index", "--", relativePath, target],
    { encoding: "utf8" },
  );
  console.log(`--- PRETTIER DIFF: ${relativePath} ---`);
  console.log(result.stdout);
  rmSync(target, { force: true });
}
