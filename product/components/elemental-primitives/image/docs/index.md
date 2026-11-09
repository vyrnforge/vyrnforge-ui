# Image

Responsive presentation over native img while preserving authored image semantics and loading attributes.

## Native baseline

Use the native semantic element or authored semantic context defined by the Layer 1 contract. VyrnForge adds presentation only; browser semantics and authored attributes remain authoritative.

## Accessibility

Follow the Layer 1 contract's consumer responsibilities. This primitive adds no custom keyboard interaction. Forced-colors and reduced-motion behavior apply where relevant.

## Native Web

Load `@vyrnforge/web/styles/image.css` and use its documented `data-vf-*` hook.
