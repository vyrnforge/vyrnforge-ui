---
type: major
---

Combobox now derives the input and listbox IDs from the root identity in React and Vue, matching the existing Angular root policy. Pass an optional root `id` to choose the namespace; the native input ID is `${id}-input` and the listbox ID is `${id}-listbox`. Migrate independently supplied input/content IDs and input aria-controls to the root. Explicit accessible naming relationships remain supported. The root remains renderless in React/Vue; Native Web and Elements keep authored IDs. Controlled query/value and custom form policy are not changed.
