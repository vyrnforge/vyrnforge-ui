import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredFiles = [
  "docs/metadata/cross-framework-browser-matrix.json",
  "docs/testing/cross-framework-browser-matrix.md",
  "scripts/verify-consumer-foundations-runtime.mjs",
  ".github/workflows/_consumer.yml",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

export function verifyCrossFrameworkBrowserMatrix({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      failures.push(`required CF-7009 file is missing: ${file}`);
    }
  }
  if (failures.length > 0) return failures.sort();

  const metadata = JSON.parse(
    read(root, "docs/metadata/cross-framework-browser-matrix.json"),
  );

  if (
    metadata.program?.task !== "CF-7009" ||
    metadata.program?.sprint !== "S7"
  ) {
    failures.push(
      "cross-framework browser matrix program must be S7 / CF-7009",
    );
  }

  if (
    !["runtime-ready", "evidence-complete"].includes(metadata.program?.status)
  ) {
    failures.push("CF-7009 status must be runtime-ready or evidence-complete");
  }

  const expectedClaim =
    metadata.program?.status === "evidence-complete"
      ? "cross-framework-browser-matrix-verified"
      : "cross-framework-browser-matrix-runtime-ready";
  if (metadata.supportClaim !== expectedClaim) {
    failures.push(`CF-7009 support claim must be ${expectedClaim}`);
  }

  for (const consumer of ["native-html", "react", "angular", "vue"]) {
    if (!(metadata.consumers ?? []).includes(consumer)) {
      failures.push(`CF-7009 matrix is missing ${consumer}`);
    }
  }

  if ((metadata.sharedScenarios ?? []).length < 3) {
    failures.push(
      "CF-7009 must define at least three shared browser scenarios",
    );
  }

  const runtime = read(root, "scripts/verify-consumer-foundations-runtime.mjs");
  for (const marker of [
    "--matrix-report",
    "--trace-dir",
    "verifySharedMatrixScenario",
    "waitForSharedMatrixStatus",
    'detached: process.platform !== "win32"',
    "process.kill(-processHandle.pid",
    "await stopProcess(server)",
    "server.stdout?.destroy()",
    "canonical-action-event",
    "tabs-property-assignment",
    "text-input-value-property",
  ]) {
    if (!runtime.includes(marker)) {
      failures.push(`consumer runtime matrix is missing ${marker}`);
    }
  }

  const workflow = read(root, ".github/workflows/_consumer.yml");
  for (const marker of [
    "verify:cross-framework-matrix:runtime",
    "cross-framework-browser-matrix",
    "actions/upload-artifact@",
  ]) {
    if (!workflow.includes(marker)) {
      failures.push(`consumer CI workflow is missing ${marker}`);
    }
  }

  const rootPackage = JSON.parse(read(root, "package.json"));
  for (const script of [
    "verify:cross-framework-matrix",
    "test:cross-framework-matrix",
    "verify:cross-framework-matrix:runtime",
  ]) {
    if (!rootPackage.scripts?.[script]) {
      failures.push(`root package scripts are missing ${script}`);
    }
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyCrossFrameworkBrowserMatrix();
  if (failures.length > 0) {
    console.error("Cross-framework browser matrix verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Cross-framework browser matrix static verification passed.");
  }
}
