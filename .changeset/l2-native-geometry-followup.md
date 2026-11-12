---
"@vyrnforge/web": patch
---

Tighten the retained Layer 2 native-control geometry without changing public APIs.

- Make Button small/medium/large one-line geometry align with the shared 32/40/48 control-size targets while preserving content growth.
- Replace Textarea's fixed 6rem minimum with the shared medium control minimum so authored native `rows` remains visually meaningful.
- Remove the obsolete `data-vf-text` typography opt-out from Button and Link so interactive-control typography remains control-owned after the `textVariant` API removal.
