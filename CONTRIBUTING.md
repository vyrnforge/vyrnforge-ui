# Contributing to VyrnForge UI

Thanks for helping improve VyrnForge UI. VyrnForge is a dependency-minimal,
multi-framework enterprise UI foundation, not only a React component package or
data-grid library.

The repository is source-available under the
[VyrnForge Source License 1.0](LICENSE). Do not describe it as open source or
broaden the rights granted by the license.

## Integration-lane contribution path

`main` is the canonical integrated product branch. Normal implementation work
is integrated through persistent architectural lanes:

- `integration/foundation`
- `integration/native`
- `integration/react`
- `integration/angular`
- `integration/vue`
- `integration/data-grid`
- `integration/docs`
- `integration/platform`

Create a short-lived tracker or bounded-objective branch from the owning lane.
Open the task PR back to that lane. Changes reach `main` through a lane promotion
PR (`integration/<lane>` -> `main`), which always receives full repository
validation. Direct task PRs to `main` are reserved for explicit emergency
hotfixes and receive the same full gate.

Persistent lanes are peers, not a framework dependency chain. Shared work goes
through the appropriate shared lane, is promoted to `main`, and is then consumed
by React, Angular, Vue, Native, data-grid, docs, or platform lanes as needed.

Only stack work on another unmerged branch when there is a real technical or
tracker dependency. Record the dependency in the PR and return the work to its
owning lane after the prerequisite is promoted.

The complete branch, lane synchronization, promotion, change-impact,
documentation, playground, and deployment contract is documented in
[`docs/governance/05-trunk-delivery.md`](docs/governance/05-trunk-delivery.md).

Repository development uses the Node.js and npm versions pinned by `.nvmrc`,
`.node-version`, and the root `packageManager`.

```bash
git clone https://github.com/vyrnforge/vyrnforge-ui.git
cd vyrnforge-ui
npm ci

# switch to the owning integration lane, sync it with main, then create the
# short-lived tracker branch

npm run check
npm test
npm run build
```

Open the task pull request against the owning `integration/<lane>`. Open a
promotion pull request from that lane to `main` when the lane changes are ready
for product-wide integration.

Those are the normal contributor commands. CI determines required technical
scope from changed paths and the actual workspace dependency graph with
`scripts/detect-ci-scope.mjs`; contributors do not maintain a duplicated package
matrix in the PR description.

Task PRs use affected-scope CI. Promotion and emergency-hotfix PRs into `main`
use full validation. Accepted integration-lane merges and routine lane
synchronization do not start a duplicate CI run. After a successful main-boundary
PR merges, the exact `main` push runs only the delivery scope required to build
commit-bound deployment artifacts; it does not repeat the full promotion suite.

`npm run ci` is available for complete local repository validation when a
maintainer, infrastructure change, promotion preparation, or unusually broad
change needs it.

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

- the owning integration lane and tracker/bounded objective;
- what changed and why;
- public API, CSS, behavior, accessibility, documentation, playground/example,
  release, or migration impact;
- whether the PR is a task PR or lane-to-`main` promotion;
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
