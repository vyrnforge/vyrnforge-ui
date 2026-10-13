import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const normalTemplate = ".github/pull_request_template.md";
const infrastructureTemplate =
  ".github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md";
const releaseTemplate = ".github/PULL_REQUEST_TEMPLATE/release.md";
const retiredPullRequestTemplates = [
  ".github/PULL_REQUEST_TEMPLATE/change-manifest.md",
  ".github/PULL_REQUEST_TEMPLATE/component-or-package.md",
  ".github/PULL_REQUEST_TEMPLATE/docs-and-examples.md",
  ".github/PULL_REQUEST_TEMPLATE/repository-maintenance.md",
];

function read(root, relativePath, failures) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(
      `${relativePath}: required repository intake file is missing`,
    );
    return "";
  }
  return readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
}

function requireText(content, relativePath, requiredText, failures) {
  for (const required of requiredText) {
    if (!content.includes(required)) {
      failures.push(
        `${relativePath}: missing required contributor text: ${required}`,
      );
    }
  }
}

function rejectContributorHistory(content, relativePath, failures) {
  const forbidden = [
    [/\bnpm run quality\b/u, "removed command npm run quality"],
    [/\bnpm run verify:ci\b/u, "removed command npm run verify:ci"],
    [/\bTask ID(?:\(s\))?:/iu, "internal task identity"],
    [/\bSprint:/iu, "internal sprint field"],
    [/\bQuality gate:/iu, "internal quality-gate field"],
    [/\bManifest lifecycle/iu, "change-manifest lifecycle field"],
    [/\b(?:RS|MF|CF|EL|BT|VF)-\d{4}\b/u, "internal task identifier"],
    [/\bGMF[1-4]\b/u, "historical framework gate identifier"],
  ];
  for (const [pattern, label] of forbidden) {
    if (pattern.test(content)) {
      failures.push(
        `${relativePath}: normal contributor guidance contains ${label}`,
      );
    }
  }
}

export function verifyRepositoryTemplates({ root = repositoryRoot } = {}) {
  const failures = [];

  for (const retired of retiredPullRequestTemplates) {
    if (existsSync(path.join(root, retired))) {
      failures.push(
        `${retired}: retired focused template must stay removed; the CI planner owns normal technical scope`,
      );
    }
  }

  const agents = read(root, "AGENTS.md", failures);
  requireText(
    agents,
    "AGENTS.md",
    [
      "docs/governance/05-trunk-delivery.md",
      "## Agent branch and delivery contract",
      "`main` is the canonical releasable branch",
      "use a stacked PR only when the dependency is real",
      "full protected mainline gate",
      "Do not push normal work directly to `main`",
      "Never use a missing host",
      "Temporary `integration/<initiative>` branches",
    ],
    failures,
  );

  const contributing = read(root, "CONTRIBUTING.md", failures);
  requireText(
    contributing,
    "CONTRIBUTING.md",
    [
      "## Branch and PR contribution path",
      "`main` is the canonical protected release boundary.",
      "Temporary `integration/<initiative>` branches are allowed",
      "docs/governance/05-trunk-delivery.md",
      "npm ci",
      "git switch main",
      "git pull --ff-only origin main",
      "git switch -c <short-lived-branch>",
      "npm run check",
      "npm test",
      "npm run build",
      "Use a mainline PR to protected `main`",
      "Use a stacked PR only when a real dependency exists.",
      "scripts/detect-ci-scope.mjs",
      "actual workspace dependency graph",
      "exact `main` push",
      "The default pull-request template is the normal path.",
      "A new publishable workspace must be introduced together with repository",
      "ci-cd-infrastructure.md",
      "release.md",
      "SECURITY.md",
    ],
    failures,
  );
  if (/\bnpm install\b/u.test(contributing)) {
    failures.push(
      "CONTRIBUTING.md: repository setup must use npm ci instead of npm install",
    );
  }
  rejectContributorHistory(contributing, "CONTRIBUTING.md", failures);

  const fallback = read(root, normalTemplate, failures);
  requireText(
    fallback,
    normalTemplate,
    [
      "## Summary",
      "## PR topology",
      "## Impact matrix",
      "## Compatibility / migration",
      "## Validation",
      "## Notes",
      "**Base:**",
      "**Depends on:**",
      "**Retarget plan for stacked PRs:**",
      "Package/release lifecycle",
      "`npm run check`",
      "`npm test`",
      "`npm run build`",
      "New or changed publishable workspaces have an explicit release lifecycle classification.",
      "If this is non-mainline, the dependency/base is explicit",
      "main is the canonical releasable branch",
      "docs/governance/05-trunk-delivery.md",
    ],
    failures,
  );
  for (const obsoleteScope of [
    "Select every affected area",
    "Select every directly or transitively affected package",
    "generated CI plan matches",
  ]) {
    if (fallback.includes(obsoleteScope)) {
      failures.push(
        `${normalTemplate}: author-owned CI/package scope checklist must stay removed: ${obsoleteScope}`,
      );
    }
  }
  rejectContributorHistory(fallback, normalTemplate, failures);

  const infrastructure = read(root, infrastructureTemplate, failures);
  requireText(
    infrastructure,
    infrastructureTemplate,
    [
      "## Summary",
      "## Operational impact",
      "## Safety",
      "## Validation",
      "## Rollout",
      "ci-gate",
      "id-token: write",
      "npm-release",
      "`npm run check`",
      "`npm test`",
      "`npm run build`",
    ],
    failures,
  );

  const release = read(root, releaseTemplate, failures);
  requireText(
    release,
    releaseTemplate,
    [
      "## Summary",
      "## Candidate",
      "## Release evidence",
      "## Validation",
      "non-grid-beta",
      "data-grid-alpha",
      "npm-release",
      "OIDC",
      "signatures/provenance",
      "Git tag and GitHub Release",
      "`npm run check`",
      "`npm test`",
      "`npm run build`",
    ],
    failures,
  );

  const infrastructureIssue = read(
    root,
    ".github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml",
    failures,
  );
  requireText(
    infrastructureIssue,
    ".github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml",
    [
      "name: CI/CD or repository infrastructure",
      "Pull-request CI and ci-gate",
      "npm trusted publishing and OIDC",
      "Permission, secret, OIDC, or branch-protection impact",
    ],
    failures,
  );

  const releaseIssue = read(
    root,
    ".github/ISSUE_TEMPLATE/release-readiness.yml",
    failures,
  );
  requireText(
    releaseIssue,
    ".github/ISSUE_TEMPLATE/release-readiness.yml",
    [
      "Candidate or published version",
      "Expected npm dist-tag",
      "npm OIDC publication",
      "Registry signatures or provenance attestations",
      "Expected final state",
    ],
    failures,
  );

  const issueConfig = read(root, ".github/ISSUE_TEMPLATE/config.yml", failures);
  requireText(
    issueConfig,
    ".github/ISSUE_TEMPLATE/config.yml",
    ["blank_issues_enabled: false", "security/advisories/new"],
    failures,
  );

  return [...new Set(failures)].sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyRepositoryTemplates();
  if (failures.length > 0) {
    console.error("Repository contribution contract verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    console.error("\nReproduce with: npm run verify:templates");
    process.exitCode = 1;
  } else {
    console.log(
      "Repository contribution contracts passed: protected mainline, bounded stacked PRs, planner-owned CI scope, and specialist infrastructure/release paths.",
    );
  }
}
