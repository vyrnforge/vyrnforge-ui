import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyBehaviorFoundations } from "./verify-behavior-foundations.mjs";
import { verifyPackageBoundaries } from "./verify-package-boundaries.mjs";
import { verifyReactBehaviorAdoption } from "./verify-react-behavior-adoption.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const taskIds = Array.from({ length: 16 }, (_, index) => `MF-${5001 + index}`);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

export function verifyGmf2Closure({ root = repositoryRoot } = {}) {
  const failures = [
    ...verifyBehaviorFoundations({ root }),
    ...verifyPackageBoundaries({ root }),
    ...verifyReactBehaviorAdoption({ root }),
  ];
  const metadataPath = path.join(root, "docs/metadata/gmf2-closure.json");
  if (!existsSync(metadataPath))
    return [...failures, "missing docs/metadata/gmf2-closure.json"].sort();
  const closure = readJson(root, "docs/metadata/gmf2-closure.json");
  if (closure.gate !== "GMF2" || closure.status !== "evidence-complete")
    failures.push("GMF2 closure must be evidence-complete");
  if (closure.requiredCiGate !== "ci-gate")
    failures.push("GMF2 must require ci-gate");

  const tasks = new Map(
    (closure.tasks ?? []).map((task) => [task.id, task.status]),
  );
  for (const id of taskIds)
    if (tasks.get(id) !== "done")
      failures.push(`${id} must be done in GMF2 closure metadata`);
  if (tasks.size !== taskIds.length)
    failures.push(
      "GMF2 closure task inventory must contain exactly MF-5001 through MF-5016",
    );

  for (const evidence of closure.evidence ?? []) {
    if (!existsSync(path.join(root, evidence)))
      failures.push(`GMF2 evidence is missing ${evidence}`);
  }
  if (
    !Array.isArray(closure.unresolvedBlockers) ||
    closure.unresolvedBlockers.length !== 0
  )
    failures.push("GMF2 unresolvedBlockers must be an empty array");

  const behavior = readJson(root, "docs/metadata/behavior-foundations.json");
  if (behavior.program?.gateStatus !== "passed")
    failures.push("behavior foundation GMF2 gateStatus must be passed");
  if ((behavior.remainingGmf2Tasks ?? []).length !== 0)
    failures.push("behavior foundation remainingGmf2Tasks must be empty");

  const multiFramework = readJson(root, "docs/metadata/multi-framework.json");
  if (multiFramework.program?.currentSprint !== "S6")
    failures.push(
      "multi-framework currentSprint must advance to S6 after GMF2 closure",
    );
  if (multiFramework.behaviorFoundation?.gateStatus !== "passed")
    failures.push(
      "multi-framework behaviorFoundation gateStatus must be passed",
    );
  if (multiFramework.behaviorFoundation?.currentBatch !== "MF-5015-MF-5016")
    failures.push("multi-framework currentBatch must be MF-5015-MF-5016");

  for (const command of ["npm run verify:ci", "npm run quality"]) {
    if (!(closure.requiredCommands ?? []).includes(command))
      failures.push(`GMF2 closure is missing required command ${command}`);
  }
  return [...new Set(failures)].sort();
}

export function assertGmf2Closure(options) {
  const failures = verifyGmf2Closure(options);
  if (failures.length)
    throw new Error(
      `GMF2 closure verification failed:\n- ${failures.join("\n- ")}`,
    );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertGmf2Closure();
  console.log(
    "GMF2 closure passed: MF-5001 through MF-5016, React adoption, package boundaries, and behavior parity evidence are complete.",
  );
}
