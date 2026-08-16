import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const npmCliPath = process.env.npm_execpath;
const evidenceRoot = path.join(
  repositoryRoot,
  "tests/consumers/.tmp-s11-button-slice",
);
const matrixReportPath = path.join(evidenceRoot, "matrix.json");
const accessibilityReportPath = path.join(evidenceRoot, "accessibility.json");
const traceDirectory = path.join(evidenceRoot, "traces");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runNpm(args) {
  const command = npmCliPath
    ? process.execPath
    : process.platform === "win32"
      ? "npm.cmd"
      : "npm";
  const commandArgs = npmCliPath ? [npmCliPath, ...args] : args;
  execFileSync(command, commandArgs, {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
  });
}

function readJson(filePath) {
  assert(existsSync(filePath), `Button runtime evidence is missing ${filePath}`);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function verifyMatrix(report) {
  assert(report.status === "passed", "Button cross-framework matrix did not pass");
  assert(
    Array.isArray(report.consumers) && report.consumers.length === 4,
    "Button cross-framework matrix must record all four consumers",
  );
  for (const consumer of report.consumers) {
    assert(
      consumer.scenarios?.["generated-button-facade"] === true,
      `${consumer.consumer}: generated Button facade scenario did not pass`,
    );
    assert(
      consumer.scenarios?.["generated-button-styling"] === true,
      `${consumer.consumer}: generated Button styling scenario did not pass`,
    );
  }
}

function verifyAccessibility(report) {
  assert(
    report.status === "automated-passed",
    "Button cross-framework accessibility automation did not pass",
  );
  assert(
    Array.isArray(report.consumers) && report.consumers.length === 4,
    "Button accessibility report must record all four consumers",
  );
  for (const consumer of report.consumers) {
    assert(
      consumer.axe?.seriousOrCriticalCount === 0,
      `${consumer.consumer}: generated Button surface has serious/critical accessibility violations`,
    );
    assert(
      consumer.scenarios?.["keyboard-action-activation"] === true,
      `${consumer.consumer}: generated Button keyboard activation did not pass`,
    );
  }
}

rmSync(evidenceRoot, { force: true, recursive: true });

try {
  runNpm([
    "run",
    "verify:consumer-foundations:runtime",
    "--",
    "--matrix-report",
    path.relative(repositoryRoot, matrixReportPath),
    "--trace-dir",
    path.relative(repositoryRoot, traceDirectory),
    "--accessibility-report",
    path.relative(repositoryRoot, accessibilityReportPath),
  ]);

  verifyMatrix(readJson(matrixReportPath));
  verifyAccessibility(readJson(accessibilityReportPath));
  console.log(
    "MFD-1112 Button runtime parity passed across Native, React, Angular, and Vue.",
  );
} finally {
  rmSync(evidenceRoot, { force: true, recursive: true });
}
