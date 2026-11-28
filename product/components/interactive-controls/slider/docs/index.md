# Slider

Slider adjusts one bounded numeric value using a native range input. Use it for approximate adjustment, such as volume or brightness. Use Input or NumberField for exact entry, and RangeSlider for two coordinated endpoints.

## Basic usage

Give the control an accessible label, meaningful bounds and an appropriate step. The native input owns form association, value sanitization, keyboard and pointer behavior.

## Sizes and orientation

Use sm, md (default), or lg. Native Web uses data-vf-size and data-vf-orientation; framework adapters expose size and orientation. Horizontal follows document direction; vertical increases from bottom to top. Preserve a generous interaction target.

## Values and marks

Use min, max and step; step="any" allows continuous adjustment. Native list/datalist is supported. Marks identify positions, not additional selection constraints. Use sparse labeled marks and avoid relying on labels alone for accessible value meaning. When space is insufficient, visual labels are clamped or suppressed to prevent collisions; the tick positions remain unchanged.

## Value labels and descriptive tooltips

Use the Slider tooltip option for numeric feedback: false (default) disables it, true reveals it during hover, dragging or keyboard-visible focus, and an options object selects display (auto or always), placement, size, arrow and format. The shared Tooltip surface and native positioning follow a non-interactive anchor at the thumb center, including at both endpoints. Only viewport collisions may shift or flip the surface. Default clearance from the thumb to the arrow tip or arrowless surface is 0.75rem (12px at a 16px root), leaving room for the active halo. An explicitly themed Tooltip offset overrides this default. The arrow is optional (off by default); the default size is sm and placement is top for horizontal, left for vertical. Format supplies the displayed value and accessible value text unless separately authored. The numeric surface is decorative and must not create a second focus target or descriptive tooltip role. A descriptive Tooltip is separate and may explain the control, but essential instructions belong in visible text. Native Web and the Angular directive use an authored direct parent with data-vf-slider-presentation for optional marks and labels. React and Vue provide that presentation host automatically. Use the opt-in connectSlider function from @vyrnforge/web/slider for native enhanced paint and refresh after direct script value writes; disconnect on teardown. Plain CSS-only markup remains a usable native range input.

## Controlled and uncontrolled state

Preserve the browser's range semantics. Controlled values are owned by the consuming application. Native reset restores uncontrolled initial values. Compose a numeric Input when precise adjustment is needed.

## Disabled and invalid states

Disabled inputs cannot be changed or submitted. Required and readonly are not applicable to native range inputs. Use visible text for a fixed value and application-owned validation, aria-invalid and an associated message when a constraint is violated.

## Accessibility and styling

Use native labels, visible keyboard focus, accessible value context and shared semantic tokens. Preserve native keyboard behavior, directionality, touch and forced colors. Theme customization uses createTheme public tokens; do not use component-specific styling props. Enhanced presentation must not replace the native input or its form participation.

## Related controls

Use RangeSlider for two endpoints; use Input or NumberField for exact numeric entry. Use Tooltip for supplemental help.
