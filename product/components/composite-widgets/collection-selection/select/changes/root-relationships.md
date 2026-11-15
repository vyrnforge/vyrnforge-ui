---
type: major
---

React, Vue and Angular Select derive trigger and listbox IDs from an optional root `id`; use `${id}-trigger` and `${id}-listbox` for integrations. Migrate independent part IDs and trigger aria-controls to the root. Consumer-authored accessible names remain required. Elements preserves authored popup IDs and derives the relationship from the actual content. Native Web remains authored markup.
