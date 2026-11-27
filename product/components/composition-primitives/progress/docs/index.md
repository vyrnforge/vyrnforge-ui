# Progress

Communicate completion of an operation, independently of loading indicators and placeholders.

## Native Web

Load `@vyrnforge/web/styles/progress.css`. Use native `<progress data-vf-progress>` with an accessible label. Set value and max only from truthful operation data; omit value for unknown progress.

## Customization

The linear native presentation uses `--vf-progress-color`, `--vf-progress-track-color`, `--vf-progress-size`, and `--vf-progress-radius`. Standard CSS can set inline dimensions. Forced colors retain native semantics.

## Accessibility

Provide an accessible name, avoid announcing every numeric update, and leave cancellation, retry and operation state to the application. Circular appearance is a separate follow-up; do not replace native semantics with a decorative spinner.
