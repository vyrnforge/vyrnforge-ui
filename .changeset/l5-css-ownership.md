---
"@vyrnforge/web": patch
---

Repair isolated L5 compound-field, choice-control, and command-menu stylesheet imports. Common rules live in private shared Web styles, and each component keeps its own local selectors. Preserve visible keyboard focus in forced-colors mode and use logical joined corners for SplitButton.
