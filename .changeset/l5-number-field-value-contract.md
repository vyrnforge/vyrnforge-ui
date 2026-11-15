---
"@vyrnforge/react": major
"@vyrnforge/angular": major
"@vyrnforge/vue": major
---

NumberField uses nullable committed numeric values, native editing/validity and native stepping. Empty values emit null rather than zero; bounds and step are root-owned native constraints instead of coercion. Controlled owners retain the committed value when a request is rejected. Move input-level value/defaultValue/min/max/step to the root; handle null in value-change callbacks. Step controls are non-submit buttons and respect disabled/read-only/step-any state.
