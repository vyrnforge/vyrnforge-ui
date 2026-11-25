# Radio Group

Use Radio Group when the user must choose one of a visible set of mutually exclusive options. Compose public Radio controls with a native fieldset and legend and the shared layout primitives. The pattern has no additional runtime or API.

## Uncontrolled selection and form submission

Use a shared name unique within the form and distinct values for the options. The browser maintains mutual exclusion and contributes the checked option to FormData. Use default checked to express the initial choice if there is one. A required radio group may start without a choice, when an explicit choice is needed.

## Controlled selection

Use one selected value in the application, not independent booleans per option. Derive checked from the value comparison. Update the selected value on change. Application-controlled values may drive an adjacent price or delivery summary.

## Validation and reset

Required on one same-name radio establishes native group validation. Disabled choices are unavailable and do not submit. Native uncontrolled reset restores the initial value; reset controlled state explicitly. Associate a description or application-owned error with the options, and do not replace browser validation with an unrelated group role.

## Accessibility and related controls

Native radios in a same-name group preserve Tab entry and arrow-key selection; do not add a roving tabindex implementation. Each option needs its own visible label and the fieldset needs a legend. Prefer wrapping layout for narrow screens. Use Checkbox Group for multiple independent choices. There is no Radio Group API or separate stylesheet.
