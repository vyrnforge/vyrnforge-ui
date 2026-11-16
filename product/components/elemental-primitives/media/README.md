# Media — elemental primitives

Media is an elemental primitive ownership family for the smallest reusable non-interactive visual/media responsibilities. It is not a runtime component, package, or public namespace.

## Members

- `media/icon` — genuine reusable visual primitive. Owns glyph definitions/rendering, variants, sizing, canonical styling, and decorative-versus-meaningful accessibility treatment.
- `media/image` — native-backed presentation treatment over `img`. Native HTML/browser behavior remains authoritative for resources, alternative text, loading, decoding, source selection, and intrinsic sizing.

## Boundaries

Media does not own loading placeholders, status semantics, color-sample semantics, Avatar fallback, galleries, image editors, zoom/crop workflows, or application asset pipelines. Structured loading placeholders belong to the Loading Pattern outside elemental primitives. Contextual color swatches belong to their owning component, such as ColorPicker. A standalone ColorSwatch is not an admitted product unit.

Stable logical component IDs and package entrypoints remain unchanged by this source-ownership family.
