# Layer 1 — Elemental primitive source ownership

Layer 1 owns semantic product units, not an aggregate `ElementalPrimitives` component.

Promoted public primitives are independently owned under this layer: Code, Kbd, Mark, Image, Skeleton, and ColorSwatch. The established core primitives remain Text, Icon, Surface, Separator, and VisuallyHidden.

Shared native prose presentation lives in the Web package's `styles/native-elements.css`. Private selection-mark recipes live in internal Web styling and are not public product units. The existing `@vyrnforge/web/styles/elemental-primitives.css` entrypoint is an aggregate convenience/compatibility stylesheet only; it is not a component identity or Product Graph owner.
