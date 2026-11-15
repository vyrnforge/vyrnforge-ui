---
"@vyrnforge/react": major
"@vyrnforge/vue": patch
"@vyrnforge/angular": patch
---

Keep SearchField query ownership on the root and reconcile native form reset and rejected edits. React SearchFieldInput no longer accepts value, defaultValue or type overrides; migrate query value/defaultValue to SearchFieldRoot. The input remains a native search control.
