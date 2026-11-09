# Elemental Primitives Web Foundation

Shared Native Web presentation for Layer 1 native-first, non-interactive primitives, owned as a VyrnForge foundation rather than a component.

The grouped Web stylesheet is available at `@vyrnforge/web/styles/elemental-primitives.css`. The aggregate `@vyrnforge/web/styles.css` also includes it. Neither entrypoint installs the optional global reset.

- **Code, Kbd and Mark:** keep native `code`, `pre`, `kbd` and `mark` elements; use `data-vf-code`, `data-vf-code-block`, `data-vf-kbd`, and `data-vf-mark` for explicitly opted-in presentation.
- **Image:** keep native `img` and its consumer-authored `alt`, intrinsic sizing, `loading`, and `decoding` attributes; opt in with `data-vf-image`. The library does not load assets.
- **Skeleton:** `data-vf-skeleton` is only decorative paint. Native HTML authors must set `aria-hidden="true"` and supply an appropriate accessible loading/busy indication separately; CSS cannot add accessibility attributes.
- **ColorSwatch:** `data-vf-color-swatch` visualizes the authored `--vf-color-swatch` value. Supply an adjacent text equivalent or appropriate authored accessible name when the color carries meaning.
- **Native prose:** use `data-vf-prose` on an explicit container. Outside that scope, ordinary headings, quotes, lists, figures, and other native elements are not restyled by this sheet.

`_vf-checkmark`, `_vf-radiomark`, and `_vf-selection-indicator` are private higher-layer visual recipes, not public exports or hooks. StatusIndicator and AvatarFallback remain deliberately deferred candidates.

This foundation product unit is a grouped stylesheet projection, **not** a component, UI runtime, or replacement for the separate Text, Icon, Surface, Separator, and VisuallyHidden contracts. It introduces no custom keyboard behavior. The authoritative ownership and accessibility rules are the Layer 1 Elemental Primitives Contract, CSS & Styling Architecture, and Accessibility & Interaction Standard.

Source ownership lives under `product/foundations/elemental-primitives/`; the stable consumer stylesheet remains `@vyrnforge/web/styles/elemental-primitives.css`.
