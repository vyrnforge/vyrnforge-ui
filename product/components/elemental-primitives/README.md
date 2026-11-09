# Layer 1 — Elemental primitive source ownership

Layer 1 is organized by reusable responsibility families rather than by every inventory noun.

## Typography

Typography is a first-class L1 family.

- `typography/text` owns general semantic-host × visual-role text treatment.
- `typography/code` owns specialized native code/pre presentation while reusing the shared typography scale.
- `typography/kbd` owns specialized native kbd/keycap presentation while reusing the shared typography scale.
- Native `mark` is an approved Text semantic host; it is not a separate product unit.
- Heading, Paragraph, Quote, Blockquote, emphasis/annotation, and textual metadata remain native semantics rather than separate runtime components.
- `data-vf-prose` supplies scoped automatic document typography; explicit Text treatment remains the opt-in override.

Other L1 responsibilities remain independently owned only where they add a distinct reusable contract: Icon, Image treatment, Surface, Separator, Skeleton, ColorSwatch, and VisuallyHidden.

Figure/List/Table/form/interactive semantics remain owned by their native structure or higher-layer contracts rather than being absorbed into Text.

Private selection-mark recipes live in internal Web styling and are not public product units. The existing `@vyrnforge/web/styles/elemental-primitives.css` entrypoint is an aggregate convenience stylesheet only; it is not a component identity or Product Graph owner.
