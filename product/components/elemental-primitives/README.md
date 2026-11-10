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

## Media

Media is a first-class L1 ownership family, not a runtime component or public package.

- `media/icon` is the genuine visual primitive. It owns reusable glyph definitions/rendering, sizing, variants, canonical styling, and decorative-versus-meaningful accessibility treatment.
- `media/image` is a native-backed presentation treatment over `img`. Native HTML owns alternative text, loading, decoding, source selection, fetch priority, intrinsic sizing, and browser image behavior.
- Image does not own asset loading, failure recovery, fallback composition, galleries, zooming, cropping workflows, or another higher-level media experience.
- Framework-specific Image wrappers are not required merely for symmetry; Native Web styling is currently the smallest correct reusable layer.
- The official glyph catalog remains independently distributed through `@vyrnforge/icons`; Media is source ownership, not a package boundary.

## Approved public inventory

The current public L1 inventory is exactly nine product units:

- Typography: Text, Code, Kbd.
- Media: Icon, Image.
- Independent primitives: Surface, Separator, ColorSwatch, VisuallyHidden.

Framework surfaces are justified by responsibility, not symmetry. Text, Surface, Separator, and VisuallyHidden use React/Angular/Vue convenience mappings but no dedicated Elements wrapper; Image, Code, Kbd, and ColorSwatch are Native Web-only; Icon retains all five ports because it performs real IconDefinition-to-SVG rendering.

Structured loading placeholders are not an L1 primitive; they are one presentation inside the Loading Pattern under `product/patterns/loading/`.

Figure/List/Table/form/interactive semantics remain owned by their native structure or higher-layer contracts.

Private selection-mark recipes live in internal Web styling and are not public product units. The existing `@vyrnforge/web/styles/elemental-primitives.css` entrypoint is an aggregate convenience stylesheet only; it is not a component identity or Product Graph owner.
