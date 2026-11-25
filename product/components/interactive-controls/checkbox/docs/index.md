# Checkbox

Checkbox represents one independent affirmative choice, such as accepting terms or including an item. Use a native checkbox when a user can select or clear a value. Use Switch for an immediate on/off setting and Radio for one mutually exclusive option.

## Individual selection

A checkbox has checked and unchecked states. Associate a visible label with the input; clicking the label or pressing Space while focused toggles it. Checked inputs with a name contribute their value to native form submission; unchecked and disabled inputs do not.

## Controlled and uncontrolled state

Use an initial default when the browser owns the value. Use controlled state when an application coordinates a choice with other presentation or behavior. Update the committed checked value when accepting a change.

## Indeterminate state

A mixed checkbox communicates partial selection. It is a DOM property distinct from checked, not a third submitted value. Compute it from the selected items and update the underlying selection in response to activation. See Checkbox Group for a complete select-all composition.

## Required and disabled states

Required applies to this individual checkbox. A native required checkbox must be checked to submit; it does not mean at least one of a set. Preserve disabled state and its checked appearance. HTML readonly does not prevent checkbox activation; use disabled when the control is unavailable, and present a noninteractive summary when a value is purely informational.

## Accessibility and styling

Use the native input role and label; use an associated description or validation message when needed. Keep keyboard focus visible. Preserve the shared 24 CSS-pixel indicator target, theme colors, forced colors and reduced motion. Use the existing layout and text primitives for a larger clickable label, not a new checkbox styling system.

## Related controls

Use Checkbox Group for coordinated multiple selection and select-all, or Radio Group for one exclusive choice.
