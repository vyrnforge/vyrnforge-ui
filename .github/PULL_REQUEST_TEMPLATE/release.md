## Summary

Describe the coordinated VyrnForge release, the included user-visible changes, and why this version is ready.

## Release identity

**Version:**

**npm dist-tag:** `alpha` / `beta` / `next` / `latest`

**Release commit:**

**Included packages:**

- [ ] `@vyrnforge/ui-core`
- [ ] `@vyrnforge/ui-components`
- [ ] `@vyrnforge/ui-data-grid`

## Candidate integrity

- [ ] All package manifests use the exact coordinated version.
- [ ] Internal dependencies use the exact coordinated version.
- [ ] The version does not already exist for any package on npm.
- [ ] Changelog, release notes, migration notes, package READMEs, metadata, and examples match the candidate.
- [ ] Package payloads contain expected runtime files, declarations, CSS entries, LICENSE, and README.
- [ ] Fresh packed-consumer installation, typecheck, and production build passed.

## Trusted publishing and release record

- [ ] Release verification completed before requesting publication approval.
- [ ] npm publication uses the protected `npm-release` environment and job-scoped OIDC.
- [ ] No `NPM_TOKEN`, `NODE_AUTH_TOKEN`, personal access token, or long-lived publishing credential is used.
- [ ] Publication order is `ui-core` → `ui-components` → `ui-data-grid`.
- [ ] Registry propagation and exact dependency metadata are verified after each publication.
- [ ] Registry signatures/provenance and a fresh registry consumer are verified before creating the release record.
- [ ] The Git tag and GitHub Release are created only after successful registry verification.

## Validation

- [ ] `npm run quality` passed for the final candidate.
- [ ] Release workflow verify mode passed for this exact version and dist-tag.
- [ ] No uncommitted or generated release artifact is present.
- [ ] Rollback or partial-publication handling is documented.

## Approval and evidence

Link the release workflow run, approval record, npm packages, provenance evidence, consumer result, Git tag, GitHub Release, and any remaining limitations.
