import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyPackageBoundaries } from "./verify-package-boundaries.mjs";
import { verifyMultiFrameworkArchitecture } from "./verify-multi-framework-architecture.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const taskIds = Array.from({ length: 12 }, (_, index) => `MF-${4001 + index}`);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

export function verifyGmf1Closure({ root = repositoryRoot } = {}) {
  const failures = [
    ...verifyPackageBoundaries({ root }),
    ...verifyMultiFrameworkArchitecture({ root }),
  ];
  const metadataPath = path.join(root, "docs/metadata/gmf1-closure.json");
  if (!existsSync(metadataPath))
    return [...failures, "missing docs/metadata/gmf1-closure.json"].sort();
  const closure = readJson(root, "docs/metadata/gmf1-closure.json");
  if (closure.gate !== "GMF1" || closure.status !== "evidence-complete")
    failures.push("GMF1 closure must be evidence-complete");
  if (closure.requiredCiGate !== "ci-gate")
    failures.push("GMF1 must require ci-gate");
  const tasks = new Map(
    (closure.tasks ?? []).map((task) => [task.id, task.status]),
  );
  for (const id of taskIds)
    if (tasks.get(id) !== "done")
      failures.push(`${id} must be done in GMF1 closure metadata`);
  if (tasks.size !== taskIds.length)
    failures.push(
      "GMF1 closure task inventory must contain exactly MF-4001 through MF-4012",
    );
  for (const packageName of [
    "@vyrnforge/ui-behaviors",
    "@vyrnforge/ui-elements",
  ]) {
    const item = closure.packageFoundations?.[packageName];
    if (
      item?.status !== "current" ||
      !existsSync(path.join(root, item.directory ?? "", "package.json"))
    )
      failures.push(`${packageName} foundation must be current and present`);
  }
  if (
    !Array.isArray(closure.unresolvedBlockers) ||
    closure.unresolvedBlockers.length !== 0
  )
    failures.push("GMF1 unresolvedBlockers must be an empty array");
  for (const command of ["npm run verify:ci", "npm run quality"])
    if (!(closure.requiredCommands ?? []).includes(command))
      failures.push(`GMF1 closure is missing required command ${command}`);
  return [...new Set(failures)].sort();
}

export function assertGmf1Closure(options) {
  const failures = verifyGmf1Closure(options);
  if (failures.length) {
    throw new Error(
      `GMF1 closure verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertGmf1Closure();
  console.log(
    "GMF1 closure passed: MF-4001 through MF-4012 evidence and package foundations are complete.",
  );
}
