# Collection Navigation

Canonical Layer 4 Core capability for ordered one-dimensional collection movement.

## Owns

- previous / next / first / last navigation intent
- item eligibility for the navigation calculation
- optional looping
- horizontal/vertical arrow-intent mapping
- LTR/RTL horizontal direction mapping

## Does not own

- semantic disabled state
- focus strategy or `focus()`
- roving tabindex or `aria-activedescendant`
- selection
- tree/spatial/grid navigation
- event listeners, refs, lifecycle or framework state

Components translate their own semantics into `eligible`. For example, a disabled Listbox option may be ineligible while a disabled Menu item may remain eligible for focus navigation.
