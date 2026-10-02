import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  getReferenceLocationContext,
  getReferenceLocationHref,
  normalizeReferencePathname,
  parseReferenceModel,
} from "../docs/reference/referenceRuntime.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const model = parseReferenceModel(
  readFileSync(path.join(root, "docs/generated/reference-model.json"), "utf8"),
);

test("canonical Reference location defaults invalid context deterministically", () => {
  assert.deepEqual(
    getReferenceLocationContext(model, {
      search: "?framework=unknown",
      hash: "",
    }),
    {
      frameworkId: "react",
      pathname: "/overview",
      member: null,
    },
  );
});

test("canonical Reference location preserves framework, document, and member identity", () => {
  const context = getReferenceLocationContext(model, {
    search: "?framework=vue&member=api-method-focus",
    hash: "#/components/button",
  });

  assert.deepEqual(context, {
    frameworkId: "vue",
    pathname: "/components/button",
    member: "api-method-focus",
  });
  assert.equal(
    getReferenceLocationHref(model, context),
    "?framework=vue&member=api-method-focus#/components/button",
  );
});

test("canonical Reference location normalizes semantic document paths", () => {
  assert.equal(
    normalizeReferencePathname("components/button"),
    "/components/button",
  );
  assert.equal(
    normalizeReferencePathname("#/patterns/settings"),
    "/patterns/settings",
  );
  assert.equal(normalizeReferencePathname(""), "/overview");
});
