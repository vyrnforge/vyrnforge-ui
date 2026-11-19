---
"@vyrnforge/web": patch
---

Avoid a duplicate clear affordance when VyrnForge SearchField renders an authored Clear button alongside a native search input. On browsers exposing an inline search-cancel control, suppress that redundant visual only when a SearchField Clear part is present. A standalone native search input keeps its browser-provided cancel behavior. The native input, keyboard semantics, and public component API are unchanged.
