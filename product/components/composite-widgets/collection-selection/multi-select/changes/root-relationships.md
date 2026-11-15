---
type: major
---

React, Vue and Angular MultiSelect derive trigger and listbox IDs from an optional root `id`; use `${id}-trigger` and `${id}-listbox` for integrations. Migrate independent part IDs and trigger aria-controls to the root. Author localized trigger content, including the empty-selection label, and popup accessible names. Elements preserves authored popup IDs and derives the relationship from actual content. Native Web remains authored markup.
