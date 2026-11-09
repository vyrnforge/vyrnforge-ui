# Layer 1 — Elemental primitive source ownership

Layer 1 owns semantic product units, not an aggregate `ElementalPrimitives` component.

The established core primitives remain Text, Icon, Surface, Separator, and VisuallyHidden. Code, Kbd, Mark, Image, Skeleton, and ColorSwatch are independently owned public elemental product units.

Code, Kbd, Mark, and Image are native-backed presentation units: native `code`/`pre`, `kbd`, `mark`, and `img` semantics remain authoritative. Their public hooks add only the presentation responsibility that belongs to that concept. They do not justify replacement semantic elements or framework wrappers for catalog symmetry, and their presentation may compose with the shared Text typography treatment on the same native element.

Heading, Paragraph, Blockquote, Quote, Figure/Caption, List/ListItem, and other supported semantic HTML remain native-first rather than separate component owners. Shared native prose presentation lives in the Web package's `styles/native-elements.css`.

Private selection-mark recipes live in internal Web styling and are not public product units. The existing `@vyrnforge/web/styles/elemental-primitives.css` entrypoint is an aggregate convenience/compatibility stylesheet only; it is not a component identity or Product Graph owner.
