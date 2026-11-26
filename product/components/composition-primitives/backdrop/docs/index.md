# Backdrop

Backdrop is a decorative local scrim for a positioned region. It dims or veils the region using the same shared paint as native modal Dialog's `::backdrop`.

## When to use

Use Backdrop in a local loading overlay when content remains underneath a visual scrim. It is not a modal, portal, click interceptor, focus trap, or scroll lock. Use the native Dialog contract for a modal or required decision. Drawer and AlertDialog retain native Dialog's backdrop, not a second rendered scrim.

## Native Web

Load `@vyrnforge/web/styles/backdrop.css`. Place a noninteractive `<div data-vf-backdrop aria-hidden="true"></div>` inside a positioned region. The region owns stacking and geometry. The scrim is absolute, fills its containing block, inherits the region's border radius, and is pointer-transparent. Hide it with the native hidden attribute or remove it.

## Loading overlay composition

Keep the operation status outside the busy region when it must be announced. If content really must be inactive, the application places native inert on the affected content, not on the overlay or its status. The application controls busy state, whether to block interaction, restoration, retry and cancellation. A visual scrim does not establish a security or interaction boundary.

## Customization

Set the optional component custom property `--vf-backdrop-color` on the scrim or its containing scope to override paint. The default mixes the current theme text color with transparency. This is a CSS paint role, not a semantic severity or new theme catalog entry. Native Dialog uses the same paint recipe; its browser top layer, pointer dismissal and focus contract remain unchanged. Forced colors uses system Canvas with partial opacity. No animation or global z-index is introduced.

## Accessibility

Backdrop is always decorative, unfocusable and hidden from assistive technology. Keep the meaning of a busy or blocked region available in authored visible text and programmatically appropriate status/busy relationships. Never make information accessible only through a scrim color. Do not put children, controls or interactive handlers on the scrim.
