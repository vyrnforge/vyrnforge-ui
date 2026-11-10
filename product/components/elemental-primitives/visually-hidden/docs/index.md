# VisuallyHidden

VisuallyHidden is the Layer 1 accessibility primitive for content that must remain available to assistive technology while being removed from ordinary visual layout.

## Native baseline

Apply the treatment to an appropriate native element. The authored element and content retain their semantics. VisuallyHidden introduces no role, ARIA state, focus behavior, keyboard handling, announcements, or interaction.

The primitive must not use `aria-hidden`, `hidden`, `inert`, `display: none`, or `visibility: hidden`, because those mechanisms remove or suppress content rather than only removing its ordinary visual presentation.

## Native Web

Load `@vyrnforge/web/styles/foundation.css` or the aggregate `@vyrnforge/web/styles.css`, then apply `data-vf-visually-hidden` to the native host.

Elements consumers use this same native hook; no dedicated custom element is required.

## Accessibility

Use VisuallyHidden only for content that genuinely belongs in the accessibility experience. It is not a generic responsive visibility system, disclosure mechanism, skip-link behavior, focus-reveal utility, or screen-reader-detection API.
