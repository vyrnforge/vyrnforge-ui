---
"@vyrnforge/react": major
"@vyrnforge/vue": major
"@vyrnforge/angular": major
"@vyrnforge/elements": patch
---

MultiSelect owns its trigger/listbox relationship. React, Vue and Angular derive part IDs from an optional root id namespace; migrate independent trigger/content IDs and aria-controls to the root. Elements preserves authored popup IDs and repairs aria-controls. Remove the fabricated English empty-selection trigger fallback; author localized trigger content and accessible names.
