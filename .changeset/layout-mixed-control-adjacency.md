---
'@vyrnforge/web': patch
---

Preserve individual border edges when non-control or wrapped children interrupt a ControlGroup's direct-child control sequence. Adjacent eligible controls remain joined in horizontal, vertical, LTR and RTL layouts. This styling correction does not change child semantics or the React public layout API.
