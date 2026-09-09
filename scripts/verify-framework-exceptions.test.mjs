import assert from "node:assert/strict";
import test from "node:test";
import { verifyFrameworkExceptions } from "./verify-framework-exceptions.mjs";

test("framework exception registry is current and auditable", () => {
  assert.doesNotThrow(() => verifyFrameworkExceptions());
});
