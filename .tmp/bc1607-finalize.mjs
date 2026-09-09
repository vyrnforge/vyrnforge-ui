import fs from "node:fs";

const packagePath = "package.json";
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
if (!packageJson.scripts["verify:metadata"].includes("verify:react-behavior-adoption")) {
  packageJson.scripts["verify:metadata"] = packageJson.scripts["verify:metadata"].replace(
    "npm run verify:framework-exceptions &&",
    "npm run verify:framework-exceptions && npm run verify:react-behavior-adoption &&",
  );
}
if (!packageJson.scripts["test:contracts"].includes("test:react-behavior-adoption")) {
  packageJson.scripts["test:contracts"] = packageJson.scripts["test:contracts"].replace(
    "npm run test:framework-exceptions &&",
    "npm run test:framework-exceptions && npm run test:react-behavior-adoption &&",
  );
}
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const workflowVerifierPath = "scripts/verify-workflows.mjs";
let workflowVerifier = fs.readFileSync(workflowVerifierPath, "utf8");
const anchor = `assert(\n  !ci.includes("uses: ./.github/workflows/"),\n  "ci.yml must own CI jobs directly instead of exposing internal reusable workflows",\n);\n`;
const addition = `${anchor}\nfor (const marker of [\n  "  react-compatibility-plan:",\n  "  react-compatibility:",\n  "docs/metadata/compatibility-release-matrix.json",\n  "npm run verify:compatibility-release-case -- --case \\${{ matrix.id }}",\n  "- react-compatibility-plan",\n  "- react-compatibility",\n  "REACT_COMPATIBILITY_REQUIRED",\n  "REACT_COMPATIBILITY_PLAN_RESULT",\n  "REACT_COMPATIBILITY_RESULT",\n]) {\n  assert(ci.includes(marker), \\`ci.yml must enforce React compatibility through \\${marker}\\`);\n}\n`;
if (!workflowVerifier.includes("REACT_COMPATIBILITY_PLAN_RESULT")) {
  if (!workflowVerifier.includes(anchor)) throw new Error("workflow verifier insertion anchor missing");
  workflowVerifier = workflowVerifier.replace(anchor, addition);
}
fs.writeFileSync(workflowVerifierPath, workflowVerifier);

for (const file of [
  "docs/metadata/react-batch-1-readiness.json",
  "docs/metadata/react-convergence-gate.json",
  "docs/metadata/react-implementation-cleanup.json",
  "docs/metadata/react-migration-matrix.json",
  "packages/ui-components/src/__tests__/react-convergence-gate.test.ts",
  "packages/ui-components/src/__tests__/react-implementation-cleanup.test.ts",
  "packages/ui-components/src/__tests__/react-migration-matrix.test.ts"
]) {
  fs.rmSync(file);
}
