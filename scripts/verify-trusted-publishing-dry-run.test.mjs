import assert from "node:assert/strict";
import test from "node:test";

import {
  createCredentialFreeEnvironment,
  createPublishDryRunArgs,
  findConfiguredPublishCredentials,
  readArgument,
} from "./trusted-publishing-dry-run.mjs";

test("builds a credential-free npm publish dry-run command", () => {
  assert.deepEqual(
    createPublishDryRunArgs({ directory: "packages/ui-core" }, "beta"),
    [
      "publish",
      "./packages/ui-core",
      "--dry-run",
      "--json",
      "--access",
      "public",
      "--tag",
      "beta",
    ],
  );
});

test("detects configured long-lived publishing credentials", () => {
  assert.deepEqual(
    findConfiguredPublishCredentials({
      NODE_AUTH_TOKEN: "secret",
      NPM_TOKEN: "another-secret",
    }),
    ["NODE_AUTH_TOKEN", "NPM_TOKEN"],
  );
});

test("removes token variables and disables provenance for the dry run", () => {
  const environment = createCredentialFreeEnvironment({
    KEEP_ME: "yes",
    NODE_AUTH_TOKEN: "secret",
    npm_config__authToken: "secret",
  });
  assert.equal(environment.KEEP_ME, "yes");
  assert.equal(environment.NODE_AUTH_TOKEN, undefined);
  assert.equal(environment.npm_config__authToken, undefined);
  assert.equal(environment.NPM_CONFIG_PROVENANCE, "false");
});

test("reads named command arguments", () => {
  const args = ["node", "script", "--release-group", "non-grid-beta"];
  assert.equal(readArgument(args, "--release-group"), "non-grid-beta");
  assert.equal(readArgument(args, "--version"), undefined);
});
