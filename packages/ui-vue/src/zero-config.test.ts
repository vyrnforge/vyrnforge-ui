import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("@vyrnforge/ui-vue zero-config application path", () => {
  it("builds facade templates without custom-element compiler configuration", () => {
    execFileSync(
      process.execPath,
      [path.join(repositoryRoot, "scripts/verify-vue-zero-config.mjs")],
      {
        cwd: repositoryRoot,
        stdio: "inherit",
      },
    );
  });
});
