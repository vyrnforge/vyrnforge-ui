# BT-8007 External Evidence

This directory is reserved for reviewed BT-8007 evidence. Do not store secrets,
OIDC tokens, npm session data, private account details, or raw authentication
responses.

Populate [`evidence.json`](evidence.json) and retain the referenced redacted captures before changing `externalEvidence.status` to `verified`:

- one redacted npm trusted-publisher settings capture per publishable package;
- one redacted GitHub `npm-release` environment protection capture;
- the successful single-path release workflow run and retained release-artifact dry-run reference;
- reviewer, review date, and any approved exception.

Repository-controlled validation alone is not sufficient to close BT-8007.

## Capture checklist

Retain redacted captures for all seven publishable packages:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`
- `@vyrnforge/ui-components`
- `@vyrnforge/ui-elements`
- `@vyrnforge/ui-angular`
- `@vyrnforge/ui-vue`
- `@vyrnforge/ui-data-grid`

Each npm capture must visibly confirm the trusted-publisher fields required by
the canonical contract: GitHub Actions provider, `vyrnforge` owner,
`vyrnforge-ui` repository, `release.yml` workflow, `npm-release`
environment, and `npm publish` allowed action.

Retain one redacted GitHub environment capture showing the `npm-release`
protection configuration, including required reviewer approval, self-review
prevention, deployment branch policy, and administrator-bypass policy. Record
the reviewer and review date separately in `evidence.json`.

Do not capture or commit secret values. To establish that no long-lived npm
publish credential is stored, record a reviewed statement about the relevant
repository/environment secret inventory without exposing secret contents,
tokens, session data, or raw authentication responses.

## Updating the evidence index

Only after every required capture has been reviewed:

1. set `reviewer` and `reviewedAt`;
2. add one `packagePublisherSettings` entry per publishable package with its
   retained capture path;
3. set `environmentProtection.capture` to the retained redacted environment
   capture;
4. preserve the successful workflow and dry-run artifact references;
5. set this evidence index to `verified`;
6. update the canonical trusted-publishing metadata from
   `pending`/`pending-external-evidence`/`not-ready` to the corresponding
   verified/ready states;
7. run:

```bash
npm run verify:trusted-publishing-provenance
```

If any external control is missing or cannot be reviewed, keep the evidence and
release-readiness status pending.
