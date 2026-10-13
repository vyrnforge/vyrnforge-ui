# Contributing to VyrnForge UI

Thanks for helping improve VyrnForge UI. VyrnForge is a dependency-minimal,
multi-framework enterprise UI foundation, not only a React component package or
data-grid library.

The repository is source-available under the
[VyrnForge Source License 1.0](LICENSE). Do not describe it as open source or
broaden the rights granted by the license.

## Branch and PR contribution path

`main` is the canonical protected release boundary. Normal work uses short-lived
branches created from current `main`. When a real prerequisite is still unmerged,
a dependent branch may instead stack on that prerequisite and must record its
base, dependency, and retarget plan in the pull request.

Temporary `integration/<initiative>` branches are allowed only when several
reviewed changes must be exercised together before the initiative can safely
reach `main`. They are bounded coordination branches, not permanent promotion
lanes or an alternate `develop` branch.

The complete branch, change-impact, CI, merge, release, and delivery contract is
[`docs/governance/05-trunk-delivery.md`](docs/governance/05-trunk-delivery.md).

Repository development uses the Node.js and npm versions pinned by `.nvmrc`,
`.node-version`, and the root `packageManager`.

```bash
git clone https://github.com/vyrnforge/vyrnforge-ui.git
cd vyrnforge-ui
npm ci

git switch main
git pull --ff-only origin main
git switch -c <short-lived-branch>

npm run check
npm test
npm run build
```

Use a mainline PR to protected `main` when the change is independently valid.
Use a stacked PR only when a real dependency exists. Non-mainline review checks
do not replace the full protected mainline gate required before the change
reaches `main`.

`scripts/detect-ci-scope.mjs` remains authoritative for technical classification
from changed paths and the actual workspace dependency graph; contributors do
not maintain a duplicated package matrix in the pull request.

After a successful protected-main merge, the exact `main` push performs the
commit-bound delivery work owned by the repository workflow rather than silently
substituting another branch.

`npm run ci` is available for complete local repository validation when a
maintainer, infrastructure change, or unusually broad change needs it.

## Before changing UI

Start from the existing VyrnForge foundations:

- reuse or extend an existing component, primitive, behavior, utility, token, or
  pattern before adding parallel UI;
- keep framework-neutral behavior and contracts outside renderer-specific
  packages when practical;
- keep application state, backend calls, auth, permissions, routing, and
  business workflows in consuming applications;
- use existing VyrnForge token and CSS contracts instead of inventing competing
  styling systems;
- do not add large UI frameworks, state-management libraries, or styling systems
  without explicit approval.

Package boundaries are documented in
[`docs/architecture/01-package-boundaries.md`](docs/architecture/01-package-boundaries.md).
The documentation entrypoint is [`docs/README.md`](docs/README.md).

## Quality and change-impact expectations

Changes should preserve accessibility, keyboard behavior, focus management,
theme and density behavior, internationalization readiness, package boundaries,
and public API compatibility where applicable.

Add or update tests for changed public behavior. Update canonical docs and
metadata when public APIs, components, tokens, package exports, release behavior,
installation, migration, or supported usage changes. Update executable examples
when a new or materially changed public capability benefits from one; do not
churn them for unrelated internal refactors.

A new publishable workspace must be introduced together with repository
inventory, dependency/CI impact, consumer evidence, documentation impact, and an
explicit release lifecycle classification. Publication may be deferred, but an
unclassified publishable workspace is not an acceptable intermediate state.

Prefer links to canonical documentation over duplicated procedures or component
lists. Do not commit credentials, `.env` files, `node_modules`, logs, archives,
package tarballs, or generated build output that the repository does not
explicitly track.

## Pull requests

The default pull-request template is the normal path. Describe the PR class,
base, dependency, retarget plan when stacked, impact matrix, compatibility or
migration impact, validation, limitations, and follow-up work.

Framework sequencing must reflect real technical dependencies rather than a
React/Angular/Vue preference order. The CI planner is authoritative for executed
checks; do not copy internal workflow topology into the PR.

Two specialist templates remain for changes that need extra operational context:

- `.github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md` for CI/CD, Pages,
  permissions, branch protection, or repository automation;
- `.github/PULL_REQUEST_TEMPLATE/release.md` for an actual prerelease publication
  candidate.

Repository issue forms remain available for defects, reusable feature proposals,
accessibility issues, infrastructure issues, and release-readiness problems.

## Security

Do not report security vulnerabilities in a public issue. Follow
[SECURITY.md](SECURITY.md) for private reporting.

## Licensing

Contributions remain subject to the repository license and project licensing
policy. Do not add alternative license identifiers, CLA requirements, or
distribution claims unless that change is explicitly approved.
