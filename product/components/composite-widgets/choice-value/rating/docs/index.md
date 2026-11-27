# Rating

Rating collects one ordered evaluation using native radio choices, or displays a non-interactive score. Use Slider for fine numeric input and Icon for decorative artwork. Application code owns review aggregation and review counts.

## Basic usage

Use a meaningful group name and localized item labels. The default scale is five stars with whole-value choices.

## Sizes and precision

Choose sm, md or lg. Interactive precision is 1 or 0.5. Half-star targets expand to preserve 24 CSS pixel minimum widths. The maximum is normalized to a whole number from 1 to 20; use a shorter scale for usability. A read-only score can contain arbitrary fractions within the scale.

## State and forms

Controlled values are committed by their owner. Hover is only a preview; disabled ratings cannot be changed or submitted. Zero means unselected. Native reset restores the initial uncontrolled value; controlled reset preserves the owner value. Required uses native radio validation. An optional explicit clear action requires an authored localized clear label; clear is unavailable for required ratings.

## Custom artwork and themes

Use the existing IconDefinition outlined and filled variants. Rating clips the filled layer in logical direction. Theme tokens control filled, empty and hover colors and target spacing; text belongs to the surrounding composition.

## Read-only scores

Provide a complete accessible score (for example, 4.7 out of 5). This is a non-interactive graphic, not a read-only form control. It has no focus or form submission. Decorative stars are Icon composition.

## Accessibility and interaction

Native radios preserve keyboard activation and group focus. Author meaningful labels and error relationships. Touch commits on native activation. Focus, selected shape and forced colors do not rely only on hue. Test the final application with assistive technology.
