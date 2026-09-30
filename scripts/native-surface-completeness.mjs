import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function readJson(root, relativePath) {
  const file = path.join(root, relativePath);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

function activeNativeScopes(exceptions) {
  const scopes = new Set();
  for (const entry of exceptions?.exceptions ?? []) {
    if (
      entry.framework !== "native" ||
      !["active", "retiring"].includes(entry.state)
    ) {
      continue;
    }
    const scope = entry.scope;
    if (typeof scope === "string") scopes.add(scope);
    else if (Array.isArray(scope)) scope.forEach((value) => scopes.add(value));
    else if (typeof scope?.component === "string") scopes.add(scope.component);
    else if (Array.isArray(scope?.components)) {
      scope.components.forEach((value) => scopes.add(value));
    }
  }
  return scopes;
}

export function verifyNativeSurfaceCompleteness(root) {
  const failures = [];
  const contracts = readJson(root, "docs/metadata/component-contracts.json");
  const exceptions = readJson(root, "docs/metadata/framework-exceptions.json");
  const manifest = readJson(root, "packages/ui-elements/custom-elements.json");
  const declarationsPath = path.join(
    root,
    "packages/ui-elements/src/custom-elements.ts",
  );
  const declarations = existsSync(declarationsPath)
    ? readFileSync(declarationsPath, "utf8")
    : "";
  const consumer = readJson(root, "docs/metadata/consumer-foundations.json");
  const browser = readJson(
    root,
    "docs/metadata/cross-framework-browser-matrix.json",
  );
  const accessibility = readJson(
    root,
    "docs/metadata/cross-framework-accessibility-review.json",
  );
  const ssr = readJson(root, "docs/metadata/ssr-bundler-compatibility.json");

  const mappedTags = new Set();
  for (const contract of contracts?.componentContracts ?? []) {
    const native = contract.frameworkMappings?.native;
    const state = native?.implementationState ?? native?.status;
    if (state !== "current") {
      failures.push(
        `${contract.id}: approved Native mapping must remain current`,
      );
      continue;
    }
    if (typeof native.tag !== "string" || !native.tag.startsWith("vf-")) {
      failures.push(`${contract.id}: Native mapping must declare a vf-* tag`);
      continue;
    }
    mappedTags.add(native.tag);
  }

  const manifestTags = new Set(
    (manifest?.modules ?? [])
      .flatMap((module) => module.declarations ?? [])
      .filter((entry) => entry.customElement === true)
      .map((entry) => entry.tagName)
      .filter(Boolean),
  );

  for (const tag of mappedTags) {
    if (!manifestTags.has(tag)) {
      failures.push(`${tag}: missing Custom Elements Manifest declaration`);
    }
    if (!declarations.includes(`"${tag}":`)) {
      failures.push(`${tag}: missing typed HTMLElement tag declaration`);
    }
  }

  const exceptionScopes = activeNativeScopes(exceptions);
  for (const tag of manifestTags) {
    if (mappedTags.has(tag)) continue;
    const scope = tag.startsWith("vf-") ? tag.slice(3) : tag;
    if (!exceptionScopes.has(scope)) {
      failures.push(
        `${tag}: public Native registration lacks a contract or active Native exception`,
      );
    }
  }

  if (mappedTags.size !== 61 || manifestTags.size !== 62) {
    failures.push(
      `Native traceability expected 61 mapped tags and 62 public registrations; received ${mappedTags.size} and ${manifestTags.size}`,
    );
  }

  const nativeFixture = (consumer?.consumerFixtures ?? []).find(
    (entry) => entry.id === "native-html",
  );
  if (nativeFixture?.supportClaim !== "packed-runtime-verified") {
    failures.push("Native HTML packed-consumer evidence is incomplete");
  }
  if (!(browser?.consumers ?? []).includes("native-html")) {
    failures.push("Native HTML browser evidence is incomplete");
  }
  if (!(accessibility?.consumers ?? []).includes("native-html")) {
    failures.push("Native HTML accessibility evidence is incomplete");
  }
  if (
    ssr?.packageImports?.registrationEntryServerSafe !== true ||
    !(ssr?.bundlerMatrix ?? []).some((entry) => entry.consumer === "native-html")
  ) {
    failures.push("Native HTML SSR/server-safe-import evidence is incomplete");
  }

  return failures.sort();
}
