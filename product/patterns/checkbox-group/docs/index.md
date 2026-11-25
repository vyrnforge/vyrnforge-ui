# Checkbox Group

Use Checkbox Group to choose several independent options that answer one question. It is a composition pattern, not another selection control or a package API. Compose existing Checkbox inputs with native fieldset and legend, and use the shared layout primitives.

## Independent choices

A named fieldset makes the relationship understandable without changing the native independent Tab stops. Use the same name with distinct values when submitting a list, and read all values from FormData. Use native default checked state when no application coordination is required.

## Select all and partial selection

Compute select-all checked from all eligible items being selected, and indeterminate from some but not all eligible items being selected. Keep disabled items out of the select-all operation. The master checkbox is an action over the selected values, not an extra submitted item. Use Space or pointer activation on the master or on each labeled item.

## Validation and reset

Required on each checkbox means each must be checked. For a minimum or maximum group selection rule, implement application-owned validation with a clear associated message, not a hidden required input. Preserve selected values after validation errors. An uncontrolled native form resets to initial values; reset controlled state at the owner.

## Accessibility and related controls

Group choices with a fieldset and legend, give every control its own label, and preserve native keyboard interaction and focus. Use Radio Group when exactly one of several options may be selected. There is no Checkbox Group API or separate stylesheet.
