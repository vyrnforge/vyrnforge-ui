import assert from "node:assert/strict";
import test from "node:test";

import { applyDependencyOverrides } from "./compatibility-release-matrix.mjs";

test("applies exact framework overrides without removing fixture tooling", () => {
  const original = {
    dependencies: { react: "19.2.7", "react-dom": "19.2.7" },
    devDependencies: { vite: "8.1.5", typescript: "7.0.2" },
  };
  const next = applyDependencyOverrides(original, {
    dependencies: { react: "18.3.1", "react-dom": "18.3.1" },
    devDependencies: { "@types/react": "18.3.31" },
  });
  assert.equal(next.dependencies.react, "18.3.1");
  assert.equal(next.devDependencies.vite, "8.1.5");
  assert.equal(next.devDependencies["@types/react"], "18.3.31");
  assert.equal(original.dependencies.react, "19.2.7");
});

test("preserves dependency groups that are not overridden", () => {
  const original = {
    dependencies: { vue: "3.5.40" },
    peerDependencies: { example: "1.0.0" },
  };
  const next = applyDependencyOverrides(original, {
    dependencies: { vue: "3.4.38" },
  });
  assert.deepEqual(next.peerDependencies, { example: "1.0.0" });
});
