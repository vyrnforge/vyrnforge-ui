import assert from "node:assert/strict";
import test from "node:test";

import { resolveDocumentationApi } from "../docs/reference/documentationApiResolver.ts";

const reference = {
  generated: {
    editable: false,
    generator: "scripts/generate-framework-api-reference.mjs",
    sources: ["docs/metadata/component-contracts.json"],
  },
  surfaces: {
    native: {
      package: "@vyrnforge/ui-elements",
      components: [{ id: "button", properties: [{ public: "disabled" }] }],
    },
    react: {
      package: "@vyrnforge/ui-components",
      components: [{ id: "button", properties: [{ public: "isDisabled" }] }],
    },
    angular: {
      package: "@vyrnforge/ui-angular",
      components: [{ id: "button", properties: [{ public: "disabled" }] }],
    },
    vue: {
      package: "@vyrnforge/ui-vue",
      components: [{ id: "button", properties: [{ public: "disabled" }] }],
    },
  },
};

test("documentation API resolution is framework-scoped and preserves concrete version context", () => {
  const react = resolveDocumentationApi(reference, {
    componentId: "button",
    frameworkId: "react",
    version: "0.2.0-beta.2",
  });
  const native = resolveDocumentationApi(reference, {
    componentId: "button",
    frameworkId: "native-html",
    version: "0.2.0-beta.2",
  });

  assert.equal(react.available, true);
  assert.equal(native.available, true);
  assert.equal(react.surfaceId, "react");
  assert.equal(native.surfaceId, "native");
  assert.equal(react.context.version, "0.2.0-beta.2");
  assert.equal(native.context.version, "0.2.0-beta.2");
  assert.notDeepEqual(react.component, native.component);
});

test("documentation API resolution never substitutes another framework surface", () => {
  const missing = resolveDocumentationApi(reference, {
    componentId: "react-only",
    frameworkId: "vue",
    version: "0.2.0-beta.2",
  });

  assert.equal(missing.available, false);
  assert.equal(missing.component, null);
  assert.equal(missing.surfaceId, "vue");
});

test("documentation API resolution requires version context and preserves generated provenance", () => {
  assert.throws(
    () =>
      resolveDocumentationApi(reference, {
        componentId: "button",
        frameworkId: "react",
        version: "",
      }),
    /requires a concrete version/u,
  );

  const resolved = resolveDocumentationApi(reference, {
    componentId: "button",
    frameworkId: "angular",
    version: "0.2.0-beta.2",
  });
  assert.equal(
    resolved.provenance.generator,
    "scripts/generate-framework-api-reference.mjs",
  );
  assert.deepEqual(resolved.provenance.sources, [
    "docs/metadata/component-contracts.json",
  ]);
});
