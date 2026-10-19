## Summary

What changed, why is it needed, and why does it belong in VyrnForge?

## PR topology

**Class:** Independent / Contract-Foundation / Framework Adapter / Stacked / Integration / Mechanical Migration / Generated / Dependency / Release Fix / Backport / Hotfix

**Tracker or bounded objective:**

**Base:** `main` / prerequisite branch / `integration/<initiative>` / `release/<version>`

**Depends on:** None / PR # / branch (describe)

**Retarget plan for stacked PRs:** None / describe when prerequisite merges

## Impact matrix

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
- Package/release lifecycle: None / affected

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
main is the canonical releasable branch.
Short-lived stacked PRs and bounded integration branches are allowed when a real
dependency requires them; they are not permanent promotion lanes or framework
branches. Full protected validation is still required before the change reaches
main. See docs/governance/05-trunk-delivery.md.
-->

## Notes

List known limitations, screenshots, dependency sequencing, follow-up work, reviewer context, or why a large/mechanical PR should remain unsplit.
