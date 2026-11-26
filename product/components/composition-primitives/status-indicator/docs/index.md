# Status Indicator

Show a compact, readable status label beside a decorative dot. Unlike Badge, it does not overlay a target; unlike Chip, it is not a capsule, filter or action.

## When to use

Use it for inline availability, job status or system state with an explicit visible label. Use ordinary Text when no marker is needed. Use Chip for compact metadata or interactive filters and Badge for anchored counts.

## Appearance and semantics

Optional severity chooses the shared informational, success, warning, error or critical paint. Omit severity for neutral text. Error and critical share danger paint; visible wording distinguishes them. The dot is aria-hidden. Do not add implicit live announcements or move focus when status changes. Use an authored persistent status region for relevant dynamic announcements.

## Native Web

Load `@vyrnforge/web/styles/status-indicator.css` and compose `data-vf-feedback`, `data-vf-feedback-severity` (optional), `data-vf-status-indicator` and a decorative `data-vf-status-indicator-dot` span. The consumer owns status meaning, localization and async state.
