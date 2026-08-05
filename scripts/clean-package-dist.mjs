import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageDirs = [
  "packages/ui-core",
  "packages/ui-behaviors",
  "packages/ui-components",
  "packages/ui-elements",
  "packages/ui-data-grid",
];

for (const packageDir of packageDirs) {
  const distDir = path.resolve(root, packageDir, "dist");

  if (!distDir.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Refusing to remove path outside repository: ${distDir}`);
  }

  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
    console.log(`Removed ${path.relative(root, distDir)}`);
  }
}
