---
'@vyrnforge/react': patch
'@vyrnforge/vue': patch
'@vyrnforge/angular': patch
---

Reconcile NumberField committed state after native form reset, restoring the initial uncontrolled number or null and preserving the latest controlled value without fabricating an input request.
