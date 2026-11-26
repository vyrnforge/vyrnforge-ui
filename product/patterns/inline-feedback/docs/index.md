# Inline Feedback

Inline feedback belongs beside the affected field or task. Use native associations and existing controls; do not promote local validation into a toast, banner or modal.

## Usage and accessibility

Associate helper and error text with aria-describedby, set aria-invalid only when invalid, and preserve the entered value. Announce a relevant state change sparingly through a persistent status region, and keep the recovery instruction available until resolved. For task errors, reuse Alert near the affected region.

## Native Web

Use native labels, validity semantics and associated message text.

## React composition

Use the existing React components from their public entrypoints. Browser-aware bundlers load the shared Web CSS; no separate Inline Feedback component is required.
