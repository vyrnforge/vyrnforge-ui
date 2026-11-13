---
'@vyrnforge/web': patch
---

Quarantine the legacy anchored-surface positioning and dismissal implementations under an explicit internal transitional directory.

The existing `@vyrnforge/web/floating-positioning` and `@vyrnforge/web/dismissal-coordination` public subpaths are temporarily preserved, but their source is no longer owned under `src/capabilities`. They now point directly at internal transitional build outputs while issue #1280 migrates consumers to browser/platform and component/port-local ownership.
