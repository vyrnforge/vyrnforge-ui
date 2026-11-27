# Slider

Slider adjusts one bounded numeric value using a native range input. Use it for approximate adjustment, such as volume or brightness. Use Input or NumberField for exact entry, and RangeSlider for two coordinated endpoints.

## Basic usage

Give the control an accessible label, meaningful bounds and an appropriate step. The native input owns form association, value sanitization, keyboard and pointer behavior.

## Sizes and orientation

Use sm, md (default), or lg. Native Web uses data-vf-size and data-vf-orientation; framework adapters expose size and orientation. Horizontal follows document direction; vertical increases from bottom to top. Preserve a generous interaction target.

## Values and marks

Use min, max and step; step="any" allows continuous adjustment. Native list/datalist is supported. Marks identify positions, not additional selection constraints. Use sparse labeled marks and avoid relying on labels alone for accessible value meaning.

## Value labels and descriptive tooltips

A value label follows the thumb and may be hidden, automatic during interaction, or persistent. Use the format of the displayed quantity in accessible value text when necessary. A descriptive Tooltip is separate and may explain the control, but essential instructions belong in visible text. React supplies enhanced marks and value labels; Native Web, Angular and Vue retain the native baseline.

## Controlled and uncontrolled state

Preserve the browser's range semantics. Controlled values are owned by the consuming application. Native reset restores uncontrolled initial values. Compose a numeric Input when precise adjustment is needed.

## Disabled and invalid states

Disabled inputs cannot be changed or submitted. Required and readonly are not applicable to native range inputs. Use visible text for a fixed value and application-owned validation, aria-invalid and an associated message when a constraint is violated.

## Accessibility and styling

Use native labels, visible keyboard focus, accessible value context and shared semantic tokens. Preserve native keyboard behavior, directionality, touch and forced colors. Theme customization uses createTheme public tokens; do not use component-specific styling props. Enhanced presentation must not replace the native input or its form participation.

## Related controls

Use RangeSlider for two endpoints; use Input or NumberField for exact numeric entry. Use Tooltip for supplemental help.
