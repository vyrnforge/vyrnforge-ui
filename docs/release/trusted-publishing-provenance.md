# Trusted Publishing and Provenance

BT-8007 verifies the repository-controlled half of npm trusted publishing and
defines the external configuration evidence required before the first beta
publication. The canonical machine-readable contract is
[`docs/metadata/trusted-publishing-provenance.json`](../metadata/trusted-publishing-provenance.json).

## Repository-controlled contract

The controlled release workflow must keep publication isolated in the
`publish-packages` job:

- GitHub-hosted `ubuntu-latest` runner;
- protected `npm-release` environment;
- `contents: read` and `id-token: write` only;
- no npm token, `NODE_AUTH_TOKEN`, `_authToken`, or equivalent long-lived
  publishing credential;
- exact release-group package order;
- automatic npm provenance from trusted publishing, without a manual
  `--provenance` flag;
- read-only registry verification of attestation metadata and
  `npm audit signatures` before a release record is created.

Candidate verification and release-record creation must not receive npm OIDC.
The release-record job may receive `contents: write` only after the registry
verification job passes.

## npm trusted-publisher settings

Configure one trusted publisher for every publishable package using these exact
values:

| Field                | Required value |
| -------------------- | -------------- |
| Provider             | GitHub Actions |
| Organization or user | `vyrnforge`    |
| Repository           | `vyrnforge-ui` |
| Workflow filename    | `release.yml`  |
| Environment          | `npm-release`  |
| Allowed action       | `npm publish`  |

The required package set is:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`
- `@vyrnforge/ui-components`
- `@vyrnforge/ui-elements`
- `@vyrnforge/ui-data-grid`

The workflow filename is only `release.yml`, not the full
`.github/workflows/release.yml` path. Values are case-sensitive.

## Protected environment evidence

The GitHub `npm-release` environment must have:

- required reviewer approval;
- self-review prevention;
- an approved deployment branch policy;
- no long-lived npm publishing secret;
- no administrator bypass unless an explicit release-governance exception is
  approved and recorded.

BT-8008 owns the wider repository ruleset, CODEOWNERS, required-check, and
branch-protection closure. BT-8007 records only the environment controls needed
for trusted publication.

## Credential-free dry run

After release validation has built the selected packages, run:

```bash
npm run verify:trusted-publishing-dry-run -- \
  --release-group non-grid-beta \
  --version 0.2.0-beta.1 \
  --dist-tag beta
```

The script removes publishing-token variables from the child process, executes
`npm publish --dry-run --json` for each package in canonical dependency order,
and writes a retained report under
`test-results/trusted-publishing/`. A dry run proves the package command and
payload preparation path without requesting OIDC or changing the registry. It
does not prove npm-side trusted-publisher configuration; that remains external
evidence.

## Closure evidence

BT-8007 remains `in-review` and release readiness remains `not-ready` until the
following evidence is recorded under `docs/release/evidence/BT-8007`:

1. npm trusted-publisher settings for every publishable package;
2. exact repository, workflow filename, environment, and allowed-action fields;
3. protected `npm-release` environment reviewer and branch policy;
4. confirmation that no long-lived npm publish token is stored;
5. a successful verify-mode workflow dry-run artifact.

Do not mark BT-8007 complete from repository checks alone.
