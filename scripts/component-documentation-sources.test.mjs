import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  COMPONENT_DOCUMENTATION_SCHEMA_PATH,
  COMPONENT_DOCUMENTATION_SCHEMA_VERSION,
  loadOwnedComponentDocumentation,
} from "./component-documentation-sources.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("package-owned component documentation is discovered and validated", () => {
  const documentation = loadOwnedComponentDocumentation({ root });
  const button = documentation.documentByComponentId.button;

  assert.equal(
    documentation.schemaVersion,
    COMPONENT_DOCUMENTATION_SCHEMA_VERSION,
  );
  assert.equal(documentation.schemaPath, COMPONENT_DOCUMENTATION_SCHEMA_PATH);
  assert(button, "Button must have an owned documentation source");
  assert.equal(button.componentId, "button");
  assert.equal(button.owner.package, "@vyrnforge/ui-elements");
  assert.equal(
    button.owner.source,
    "packages/ui-elements/src/components/actions.ts",
  );
  assert.equal(
    button.sourcePath,
    "packages/ui-elements/src/components/button.docs.json",
  );
  assert.match(button.purpose, /Text action control/u);
  assert.match(button.guidance.useWhen, /primary business actions/u);
});
