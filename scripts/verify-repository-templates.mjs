import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  assert(
    existsSync(absolutePath),
    `missing repository template: ${relativePath}`,
  );
  return readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
}

function requireText(content, relativePath, requiredText) {
  for (const required of requiredText) {
    assert(
      content.includes(required),
      `${relativePath} must include: ${required}`,
    );
  }
}

const pullRequestTemplates = {
  ".github/pull_request_template.md": [
    "## Scope",
    "scripts/detect-ci-scope.mjs",
    "ci-gate",
    "npm run verify:ci",
    "npm run quality",
  ],
  ".github/PULL_REQUEST_TEMPLATE/component-or-package.md": [
    "## Package scope",
    "@vyrnforge/ui-core",
    "@vyrnforge/ui-behaviors",
    "@vyrnforge/ui-components",
    "@vyrnforge/ui-elements",
    "@vyrnforge/ui-data-grid",
    "## Contract impact",
    "native-first",
    "store-agnostic",
    "Packed package and external-consumer verification",
  ],
  ".github/PULL_REQUEST_TEMPLATE/docs-and-examples.md": [
    "## Documentation scope",
    "## Source-of-truth review",
    "Documentation or metadata only",
    "package and consumer verification",
    "generated CI plan",
  ],
  ".github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md": [
    "## Infrastructure scope",
    "ci-gate",
    "id-token: write",
    "job-scoped",
    "No long-lived npm token",
    "npm run verify:ci",
    "## Rollout and rollback",
  ],
  ".github/PULL_REQUEST_TEMPLATE/release.md": [
    "## Release identity",
    "npm dist-tag",
    "protected `npm-release` environment",
    "job-scoped OIDC",
    "ui-core` → `ui-components` → `ui-data-grid",
    "signatures/provenance",
    "Git tag and GitHub Release",
  ],
  ".github/PULL_REQUEST_TEMPLATE/repository-maintenance.md": [
    "## Maintenance scope",
    "Dependency or lockfile update",
    "The change is not disguising a feature",
    "No package version, npm publication, dist-tag, Git tag, or GitHub Release changed",
  ],
};

const loadedPullRequestTemplates = new Map();
for (const [relativePath, required] of Object.entries(pullRequestTemplates)) {
  const content = read(relativePath);
  loadedPullRequestTemplates.set(relativePath, content);
  requireText(content, relativePath, [
    "## Summary",
    "## Validation",
    ...required,
  ]);
}

for (const [relativePath, content] of loadedPullRequestTemplates) {
  for (const obsolete of [
    "`npm run lint --if-present` passed.",
    "`npm run typecheck` passed.",
    "`npm run test` passed.",
    "`npm run build` passed.",
  ]) {
    assert(
      !content.includes(obsolete),
      `${relativePath} must not duplicate the quality suite: ${obsolete}`,
    );
  }
}

const infrastructureIssue = read(
  ".github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml",
);
requireText(
  infrastructureIssue,
  ".github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml",
  [
    "name: CI/CD or repository infrastructure",
    "Pull-request CI and ci-gate",
    "npm trusted publishing and OIDC",
    "Registry propagation, signatures, or provenance",
    "Permission, secret, OIDC, or branch-protection impact",
    "Explicitly out of scope",
  ],
);

const releaseIssue = read(".github/ISSUE_TEMPLATE/release-readiness.yml");
requireText(releaseIssue, ".github/ISSUE_TEMPLATE/release-readiness.yml", [
  "Candidate or published version",
  "Expected npm dist-tag",
  "Failing or questioned release stage",
  "npm OIDC publication",
  "Registry signatures or provenance attestations",
  "Did any package, dist-tag, Git tag, or GitHub Release already change?",
  "Expected final state",
]);

const issueConfig = read(".github/ISSUE_TEMPLATE/config.yml");
assert(
  issueConfig.includes("blank_issues_enabled: false"),
  "blank GitHub issues must stay disabled",
);
assert(
  issueConfig.includes("security/advisories/new"),
  "private security reporting link must remain configured",
);

const contributing = read("CONTRIBUTING.md");
requireText(contributing, "CONTRIBUTING.md", [
  ".github/PULL_REQUEST_TEMPLATE/",
  "component-or-package.md",
  "docs-and-examples.md",
  "ci-cd-infrastructure.md",
  "release.md",
  "repository-maintenance.md",
  "?quick_pull=1&template=",
  "`scripts/detect-ci-scope.mjs` remains authoritative",
]);

console.log("Repository pull-request and issue-template contracts passed");
