import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const requiredFiles = [
  "docs/metadata/ssr-bundler-compatibility.json",
  "docs/testing/ssr-bundler-compatibility.md",
  "scripts/verify-consumer-foundations-runtime.mjs",
  "packages/ui-elements/src/base/VyrnForgeElement.ts",
  "packages/ui-elements/src/registry.ts",
  "tests/consumers/native-html/package.json",
  "tests/consumers/react/package.json",
  "tests/consumers/angular/package.json",
  "tests/consumers/vue/package.json",
];
function read(root, rel) {
  return readFileSync(path.join(root, rel), "utf8");
}
function json(root, rel) {
  return JSON.parse(read(root, rel));
}
function fail(list, msg) {
  list.push(msg);
}
export function verifySsrBundlerCompatibility({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const file of requiredFiles)
    if (!existsSync(path.join(root, file)))
      fail(failures, `required CF-7007 file is missing: ${file}`);
  if (failures.length) return failures.sort();
  const metadata = json(root, "docs/metadata/ssr-bundler-compatibility.json");
  if (metadata.program?.task !== "CF-7007" || metadata.program?.sprint !== "S7")
    fail(failures, "SSR/bundler program must be S7 / CF-7007");
  if (metadata.program?.storyPoints !== 5)
    fail(failures, "CF-7007 story points must be 5");
  if (metadata.program?.status !== "evidence-complete")
    fail(failures, "CF-7007 status must be evidence-complete");
  if (metadata.supportClaim !== "ssr-bundler-verified")
    fail(failures, "CF-7007 support claim must be ssr-bundler-verified");
  const consumers = new Set(
    (metadata.bundlerMatrix ?? []).map((entry) => entry.consumer),
  );
  for (const consumer of ["native-html", "react", "angular", "vue"])
    if (!consumers.has(consumer))
      fail(failures, `CF-7007 bundler matrix is missing ${consumer}`);
  const react = (metadata.bundlerMatrix ?? []).find(
    (entry) => entry.consumer === "react",
  );
  if (!(react?.packages ?? []).includes("@vyrnforge/ui-components"))
    fail(
      failures,
      "React build matrix must install packed @vyrnforge/ui-components",
    );
  const runtime = read(root, "scripts/verify-consumer-foundations-runtime.mjs");
  for (const marker of [
    '"--build-only"',
    "@vyrnforge/ui-components",
    "verifyServerSafeImports",
    "react-dom/server",
    "SSR ${fixture.id}: ESM/CJS package imports passed.",
    "selectFixtureTarballs",
  ])
    if (!runtime.includes(marker))
      fail(failures, `runtime build matrix is missing ${marker}`);
  const base = read(root, "packages/ui-elements/src/base/VyrnForgeElement.ts");
  if (!base.includes("globalThis.HTMLElement ??"))
    fail(
      failures,
      "ui-elements base must retain the server-safe HTMLElement fallback",
    );
  const registry = read(root, "packages/ui-elements/src/registry.ts");
  if (!registry.includes("return globalThis.customElements"))
    fail(failures, "ui-elements registry must resolve customElements lazily");
  const rootPackage = json(root, "package.json");
  for (const script of [
    "verify:ssr-bundler",
    "test:ssr-bundler",
    "verify:ssr-bundler:runtime",
  ])
    if (!rootPackage.scripts?.[script])
      fail(failures, `root package scripts are missing ${script}`);
  return failures.sort();
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifySsrBundlerCompatibility();
  if (failures.length) {
    console.error("SSR/bundler verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else console.log("SSR/bundler static verification passed.");
}
