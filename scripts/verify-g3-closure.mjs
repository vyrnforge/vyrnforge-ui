import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  loadVisualRegressionInputs,
  verifyVisualRegressionContract,
} from "./verify-visual-regression-contract.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredTasks = Array.from(
  { length: 12 },
  (_, index) => `VF-${3001 + index}`,
);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

export function loadG3ClosureInputs(root = repositoryRoot) {
  return {
    root,
    closure: readJson(root, "docs/metadata/g3-closure.json"),
    designTokens: readJson(root, "docs/metadata/design-tokens.json"),
    visualInputs: loadVisualRegressionInputs(root),
    packageJson: readJson(root, "package.json"),
    audit: read(root, "docs/quality/s3-semantic-token-audit.md"),
    adoptionReport: read(root, "docs/quality/s3-token-adoption-report.md"),
    closureReport: read(root, "docs/quality/s3-g3-closure.md"),
    tokenArchitecture: read(
      root,
      "docs/architecture/08-semantic-token-contract.md",
    ),
  };
}

export function verifyG3Closure({
  root = repositoryRoot,
  closure,
  designTokens,
  visualInputs,
  packageJson,
  audit,
  adoptionReport,
  closureReport,
  tokenArchitecture,
}) {
  const failures = [];

  if (
    closure.schemaVersion !== 1 ||
    closure.task !== "VF-3012" ||
    closure.gate !== "G3"
  ) {
    failures.push("G3 closure metadata must use schema 1 for VF-3012/G3");
  }
  if (
    closure.state !== "evidence-complete" ||
    closure.ciGateRequired !== true
  ) {
    failures.push(
      "G3 closure must be evidence-complete and still require the authoritative ci-gate",
    );
  }
  if (
    !Array.isArray(closure.tasks) ||
    closure.tasks.length !== requiredTasks.length ||
    requiredTasks.some((task) => !closure.tasks.includes(task))
  ) {
    failures.push("G3 closure must account for VF-3001 through VF-3012");
  }
  if (!Array.isArray(closure.blockers) || closure.blockers.length !== 0) {
    failures.push("G3 closure metadata must not retain unresolved blockers");
  }

  const evidenceIds = new Set();
  for (const evidence of closure.evidence ?? []) {
    if (!evidence.id || evidenceIds.has(evidence.id)) {
      failures.push(
        `G3 evidence ID must be unique: ${evidence.id ?? "missing"}`,
      );
    }
    evidenceIds.add(evidence.id);

    if (!existsSync(path.join(root, evidence.path))) {
      failures.push(`G3 evidence file is missing: ${evidence.path}`);
    }
    if (!evidence.command || !evidence.command.startsWith("npm run ")) {
      failures.push(`G3 evidence ${evidence.id} must declare an npm command`);
    }
  }

  for (const requiredEvidence of [
    "token-contract",
    "token-adoption",
    "visual-regression",
    "visual-browser",
    "closure-report",
  ]) {
    if (!evidenceIds.has(requiredEvidence)) {
      failures.push(`G3 closure is missing ${requiredEvidence} evidence`);
    }
  }

  if (
    designTokens.sourceOfTruth?.gate !== "G3" ||
    designTokens.sourceOfTruth?.gateState !== "evidence-complete"
  ) {
    failures.push(
      "design-token metadata must identify G3 as evidence-complete",
    );
  }

  const visualFailures = verifyVisualRegressionContract(visualInputs);
  if (visualFailures.length > 0) {
    failures.push(
      `VF-3011 visual regression contract is not closed: ${visualFailures.join("; ")}`,
    );
  }

  for (const script of [
    "verify:design-tokens",
    "verify:token-adoption",
    "verify:visual-regression",
    "verify:g3-closure",
    "test:visual",
  ]) {
    if (!packageJson.scripts?.[script]) {
      failures.push(`package.json is missing G3 command ${script}`);
    }
  }

  if (
    !packageJson.scripts.quality.includes("npm run verify:visual-regression") ||
    !packageJson.scripts.quality.includes("npm run verify:g3-closure")
  ) {
    failures.push(
      "quality must enforce visual regression and G3 closure verification",
    );
  }

  for (const [name, document] of [
    ["semantic token audit", audit],
    ["token adoption report", adoptionReport],
    ["closure report", closureReport],
    ["token architecture", tokenArchitecture],
  ]) {
    if (!document.includes("VF-3011") || !document.includes("VF-3012")) {
      failures.push(`${name} must record VF-3011 and VF-3012`);
    }
  }

  if (
    !closureReport.includes("G3 evidence complete") ||
    !closureReport.includes("ci-gate")
  ) {
    failures.push(
      "G3 closure report must state evidence completeness and ci-gate requirement",
    );
  }

  return failures;
}

function run() {
  const failures = verifyG3Closure(loadG3ClosureInputs());

  if (failures.length > 0) {
    console.error("G3 closure verification failed:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    "G3 closure passed: VF-3001 through VF-3012 have complete token, adoption, visual-regression, documentation, and gate evidence; ci-gate remains the authoritative merge decision.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
