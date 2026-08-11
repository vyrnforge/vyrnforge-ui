# Contributing to VyrnForge UI

Thanks for helping improve VyrnForge UI. VyrnForge is a dependency-minimal,
multi-framework enterprise UI foundation, not only a React component package or
data-grid library.

The repository is source-available under the
[VyrnForge Source License 1.0](LICENSE). Do not describe it as open source or
broaden the rights granted by the license.

## Normal contribution path

Repository development uses the Node.js and npm versions pinned by `.nvmrc`,
`.node-version`, and the root `packageManager`.

```bash
git clone https://github.com/vyrnforge/vyrnforge-ui.git
cd vyrnforge-ui
npm ci

# make the focused change

npm run check
npm test
npm run build
```

Then open a pull request against `main`.

Those are the normal contributor commands. CI determines the required technical
scope from the changed paths with `scripts/detect-ci-scope.mjs`; contributors do
not need to predict package, consumer, docs, browser, or fixture jobs in the PR
description.

`npm run ci` is available for complete local repository validation when a
maintainer, infrastructure change, or unusually broad change needs it. It is not
an extra step required for every normal pull request.

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

## Quality expectations

Changes should preserve accessibility, keyboard behavior, focus management,
theme and density behavior, internationalization readiness, package boundaries,
and public API compatibility where applicable.

Add or update tests for changed public behavior. Update canonical docs and
metadata when public APIs, components, tokens, package exports, release
behavior, or supported usage changes. Prefer links to canonical documentation
over duplicated procedures or component lists.

Do not commit credentials, `.env` files, `node_modules`, logs, archives, package
tarballs, or generated build output that the repository does not explicitly
track.

## Pull requests

The default pull-request template is the normal path. Describe:

- what changed and why;
- public API, CSS, behavior, documentation, or migration impact;
- the validation you ran;
- relevant screenshots, limitations, or follow-up work.

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
