# Radio

Radio represents one named option in an exclusive choice. Use radios when users should see the available alternatives together. Native input semantics govern selection and form submission.

## Individual option

Give each option a visible label and a distinct value. A radio cannot normally be cleared by clicking it again. Radios with the same name and form owner are mutually exclusive; the checked option is the submitted value.

## Controlled and uncontrolled state

Use an initial checked option for an uncontrolled group, or derive each option's checked state from one application-owned value. A radio is not a toggle button and does not use indeterminate state.

## Required and disabled states

A required same-name group needs one checked option. Disabled options cannot be chosen and do not submit. Native readonly does not apply to radios. Present fixed values as text when the user is not choosing.

## Native semantics and behavior

The browser owns arrow-key selection, focus and native form interaction. Use a fieldset and legend for the related options; do not add custom roving focus or duplicate radio roles.

## Accessibility and styling

Use the shared Radio CSS and accessible labels. Keep a 24 CSS-pixel minimum native target, visible focus, forced-color treatment, reduced motion and label association. A selected radio uses an accent-colored ring and centered dot separated by a theme surface gap. The dot is half the indicator diameter. Disabled and invalid states use semantic colors, not custom per-option skins. See Radio Group for form composition and validation.

## Sizes

Use `sm`, `md` (default), or `lg` with visual diameters 20, 24, and 28 CSS pixels at the default token scale. The native target stays at least 24 CSS pixels; label typography is independent. Native Web uses `data-vf-size`; React, Angular and Vue expose `size`. Use native fieldset/legend and public layout and text primitives for grouped, horizontal, icon or descriptive labels. Selection remains a native same-name radio group.

## Related controls

Use Radio Group for exclusive selection among multiple alternatives, or Checkbox Group when several choices may be selected.
