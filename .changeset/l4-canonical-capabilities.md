---
'@vyrnforge/core': major
---

Complete Layer 4 capability ownership and narrow the retained Core behavioral contracts.

- Project CollectionNavigation and TypeaheadMatching from canonical `product/capabilities/*` owners into the stable Core public subpaths.
- Replace component-specific `disabled` inputs with calculation-specific `eligible` inputs.
- Replace `resolveEnabledIndex` with `resolveNavigationIndex`.
- Remove public `firstEnabledIndex`, `lastEnabledIndex`, `enabledIndexForValue`, and `normalizeTypeaheadText`.
- Preserve `@vyrnforge/core/collection-navigation` and `@vyrnforge/core/typeahead-matching` as the public import paths.
