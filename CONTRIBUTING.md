# Contributing to VyrnForge UI

Thanks for helping improve VyrnForge UI. VyrnForge is a dependency-minimal,
multi-framework enterprise UI foundation, not only a React component package or
data-grid library.

The repository is source-available under the
[VyrnForge Source License 1.0](LICENSE). Do not describe it as open source or
broaden the rights granted by the license.

## Trunk contribution path

`main` is the protected integration and release branch. Normal implementation
work uses a short-lived branch created from current `main` and a reviewed pull
request directly back to `main`.

Persistent `integration/*` lanes are not part of the current delivery model.
Do not recreate lane synchronization or promotion chains without a new
architectural decision. Only stack work on another unmerged branch when there is
a real technical or tracker dependency; record that dependency in the pull
request and update the dependent branch from current `main` after the
prerequisite lands.

The complete branch, protected-main, change-impact, documentation, and delivery
contract is documented in
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

Open the pull request against protected `main`. Pull requests to `main` use
full repository validation and must pass the required `ci-gate`.
`scripts/detect-ci-scope.mjs` remains authoritative for technical
classification from changed paths and the actual workspace dependency graph;
contributors do not maintain a duplicated package matrix in the pull request.

After a successful protected-main pull request merges, the exact `main` push
runs only the delivery scope required to build commit-bound deployment artifacts;
it does not repeat the already-passed merge suite.

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
- use existing `--vf-*`, `vf-*`, `--udg-*`, and `udg-*` contracts instead of
  inventing competing styling systems;
- do not add large UI frameworks, state-management libraries, or styling
  systems without explicit approval.

Package boundaries are documented in
[`docs/architecture/01-package-boundaries.md`](docs/architecture/01-package-boundaries.md).
The documentation entrypoint is [`docs/README.md`](docs/README.md).

## Quality and change-impact expectations

Changes should preserve accessibility, keyboard behavior, focus management,
theme and density behavior, internationalization readiness, package boundaries,
and public API compatibility where applicable.

Add or update tests for changed public behavior. Update canonical docs and
metadata when public APIs, components, tokens, package exports, release
behavior, installation, migration, or supported usage changes. Update the
playground/example surface when a new or materially changed public capability
benefits from executable demonstration; do not churn it for internal refactors.

A new publishable workspace must be introduced together with repository
inventory, dependency/CI impact, consumer evidence, documentation impact, and an
explicit release lifecycle classification. Publication may be deferred, but an
unclassified publishable workspace is not an acceptable intermediate state.

Prefer links to canonical documentation over duplicated procedures or component
lists. Do not commit credentials, `.env` files, `node_modules`, logs, archives,
package tarballs, or generated build output that the repository does not
explicitly track.

## Pull requests

The default pull-request template is the normal path. Describe:

- the tracker or bounded objective and any real branch dependency;
- what changed and why;
- public API, CSS, behavior, accessibility, documentation, playground/example,
  release, or migration impact;
- confirmation that the PR targets protected `main` from a short-lived branch;
- the validation you ran;
- relevant screenshots, limitations, dependencies, or follow-up work.

The CI planner is authoritative for executed checks. Do not copy a package
matrix or internal CI workflow topology into the PR.

Two specialist templates remain for changes that need extra operational
context:

- `.github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md` for CI/CD, Pages,
  permissions, branch protection, or repository automation;
- `.github/PULL_REQUEST_TEMPLATE/release.md` for an actual prerelease
  publication candidate.

Repository issue forms remain available for defects, reusable feature
proposals, accessibility issues, infrastructure issues, and release-readiness
problems.

## Security

Do not report security vulnerabilities in a public issue. Follow
[SECURITY.md](SECURITY.md) for private reporting.

## Licensing

Contributions remain subject to the repository license and project licensing
policy. Do not add alternative license identifiers, CLA requirements, or
distribution claims unless that change is explicitly approved.
