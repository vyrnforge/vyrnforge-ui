# Icon

Icon is the genuine visual primitive inside the Layer 1 Media family.

It owns reusable SVG glyph definitions/rendering, sizing, variant/shape treatment, canonical styling, and decorative-versus-meaningful accessibility behavior. It remains non-interactive: Button, Link, or another semantic owner must own interaction and the accessible name when an icon is used inside a control.

Runtime ownership remains split deliberately between the shared Web Icon contract, the optional `@vyrnforge/icons` artwork catalog, and sibling React/Angular/Vue/Elements renderers. The Media family does not create a `Media` runtime component or package.
