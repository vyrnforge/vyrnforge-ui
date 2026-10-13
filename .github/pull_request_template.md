## Summary

What changed, why is it needed, and why does it belong in VyrnForge?

## Branch / dependency

**Class:** Independent / Contract-Foundation / Framework Adapter / Stacked / Integration / Mechanical Migration / Generated / Dependency / Release Fix / Backport / Hotfix

**Tracker or bounded objective:**

**Base:** `main`

For stacked/integration/release work, replace the base above with the prerequisite branch, `integration/<initiative>`, or `release/<version>` and explain why.

**Dependency:** None / PR # / branch (describe)

**Retarget plan for stacked PRs:** None / describe when prerequisite merges

## Impact

- Shared/Core: None / affected
- Native HTML / Custom Elements: None / affected
- React: None / affected
- Angular: None / affected
- Vue: None / affected
- Tokens/Styles: None / affected
- Accessibility: None / affected
- SSR/Server safety: None / affected
- Internationalization: None / affected
- Public API: None / additive / deprecated / breaking
- Generated output: None / affected
- Documentation: None / affected

**Playground or executable example:** None / updated / existing coverage is sufficient (describe)

**Package/release lifecycle:** None / affected (describe)

## Compatibility / migration

**Breaking or migration impact:** None / describe

**Deprecation or compatibility path:** None / describe

## Validation

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Tests and contract evidence were updated where relevant.
- [ ] Docs/metadata impact was handled where relevant.
- [ ] Playground/example impact was handled where relevant.
- [ ] New or changed publishable workspaces have an explicit release lifecycle classification.
- [ ] Framework sequencing reflects real technical dependencies, not framework preference.
- [ ] If this is non-mainline, the dependency/base is explicit and the final path to protected `main` remains defined.

<!--
Pull requests to main use full protected CI and the required ci-gate.
scripts/detect-ci-scope.mjs remains the source of truth for technical
classification from changed paths and the VyrnForge dependency graph.

For a normal independent mainline change: The PR targets protected `main` from a short-lived branch.
Stacked PRs may temporarily target a real prerequisite branch, and bounded
integration branches are allowed when necessary. They are not permanent
promotion lanes or framework branches. Full protected validation is still
required before the change reaches main.
See docs/governance/05-trunk-delivery.md.
-->

## Notes

List known limitations, screenshots, dependency sequencing, follow-up work, reviewer context, or why a large/mechanical PR should remain unsplit.
