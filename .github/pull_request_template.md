## Summary

What changed, why is it needed, and why does it belong in VyrnForge?

## Branch / dependency

**Tracker or bounded objective:**

**Base:** `main`

**Dependency:** None / stacked on prerequisite (describe)

## Impact

**Public API, behavior, accessibility, or CSS:** None / describe

**Documentation or metadata:** None / describe

**Playground or executable example:** None / updated / existing coverage is sufficient (describe)

**Package/release lifecycle:** None / describe

**Breaking or migration impact:** None / describe

## Validation

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Tests and contract evidence were updated where relevant.
- [ ] Docs/metadata impact was handled where relevant.
- [ ] Playground/example impact was handled where relevant.
- [ ] New or changed publishable workspaces have an explicit release lifecycle classification.
- [ ] The PR targets protected `main` from a short-lived branch and does not reintroduce a persistent integration lane.

<!--
Pull requests to main use full protected CI and the required ci-gate.
scripts/detect-ci-scope.mjs remains the source of truth for technical
classification from changed paths and the VyrnForge dependency graph.
The exact main push performs delivery-only work after the merge suite passes.
See docs/governance/05-trunk-delivery.md.
-->

## Notes

List known limitations, screenshots, dependency sequencing, follow-up work, or reviewer context.
