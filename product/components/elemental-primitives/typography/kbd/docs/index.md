# Kbd

Presentation for native keyboard-input semantics without custom interaction.

## Native baseline

Use the native semantic element or authored semantic context defined by the Layer 1 contract. VyrnForge adds presentation only; browser semantics and authored attributes remain authoritative.

## Accessibility

Follow the Layer 1 contract's consumer responsibilities. This primitive adds no custom keyboard interaction. Forced-colors and reduced-motion behavior apply where relevant.

## Native Web

Load `@vyrnforge/web/styles/kbd.css` and use its documented `data-vf-*` hook.
