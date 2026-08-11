## Summary

Describe the prerelease candidate and the user-visible changes it contains.

## Candidate

**Release group:** `non-grid-beta` / `data-grid-alpha`

**Version:**

**npm dist-tag:** `beta` / `alpha`

**Release commit:**

## Release evidence

- [ ] Current `main` CI succeeded for the exact release commit.
- [ ] The release workflow verified the selected release group and retained
      immutable package tarballs.
- [ ] Publication uses the protected `npm-release` environment and job-scoped
      OIDC.
- [ ] Registry metadata, exact dependencies, signatures/provenance, and a fresh
      registry consumer are verified before the release record is created.
- [ ] Git tag and GitHub Release creation occur only after registry
      verification.

## Validation

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Release-specific verification passed for this exact candidate.

## Outcome and notes

Link the release workflow/evidence and record any partial-publication state,
known limitation, or required follow-up.
