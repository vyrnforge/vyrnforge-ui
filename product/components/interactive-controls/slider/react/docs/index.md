# React Slider

## React setup

Import Slider from `@vyrnforge/react/slider`. Supported CSS-aware browser bundlers load canonical styles automatically. The forwarded ref remains HTMLInputElement.

## Sizes and orientation

Pass size="sm", "md" or "lg" and orientation="horizontal" or "vertical".

## Values and marks

Pass marks to show a bounded set of step ticks, or pass an array of { value, label } definitions. Marks do not change the native step. The enhanced track reads the actual DOM value after rendering and native input events; direct script writes to input.value need an input event or React render to refresh decoration.

## Value labels and descriptive tooltips

Use valueLabelDisplay="auto" or "always", and formatValue for units or localized display. The default is "off". For explanatory text, compose the public Tooltip components rather than using the value label as help text.

## Controlled and uncontrolled state

Use defaultValue or value plus onChange. Use event.currentTarget.valueAsNumber for numeric state. Coordinate a numeric input through application state. Controlled form reset remains the owner's responsibility.

## Disabled and invalid states

Use disabled, aria-invalid and aria-describedby when appropriate. Do not add required or readonly to a range input.
