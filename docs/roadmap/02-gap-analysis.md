# Gap Analysis

This document records current strategic gaps only. Detailed component maturity
and per-component limitations belong in `docs/metadata/components.json`.

## Current gaps

| Gap                       | Why it matters                                                                                                                               | Current direction                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Repository understanding  | Current behavior should be discoverable without reconstructing historical sprint/gate work.                                                  | Complete the active documentation and contributor simplification work.          |
| Stable maturity promotion | Prerelease package channels do not make every component stable.                                                                              | Promote components only through the canonical maturity/evidence model.          |
| Real application feedback | Enterprise application adoption can expose integration, accessibility, performance, and internationalization needs not visible in fixtures.  | Add work from observed product evidence rather than speculative expansion.      |
| Data-grid evolution       | The React grid is independently versioned and broader decomposition/multi-framework rendering remains separate from the non-grid foundation. | Replan the grid as its own workstream when demand and measurements justify it.  |
| Mobile-native rendering   | The current architecture is multi-framework web, not mobile-native.                                                                          | Keep mobile-native work outside the current roadmap unless explicitly approved. |

## Planning rule

Do not carry old gap lists forward after the underlying capability exists.
Create or reprioritize work from current component metadata, defects,
measurements, real application needs, and approved architecture decisions.
