# Image

Image is the native-backed elemental primitive in the Media responsibility family.

The canonical semantic owner is native `<img>`. VyrnForge contributes only a small reusable responsive presentation hook through `@vyrnforge/web/styles/image.css`.

Image preserves consumer/browser ownership of:

- `alt` and ordinary image accessibility semantics;
- `src`, `srcset`, `sizes`, and source selection;
- intrinsic `width`/`height` sizing and aspect-ratio behavior;
- `loading`, `decoding`, `fetchpriority`, CORS/referrer policy, and other native attributes;
- loading/error events and application-specific recovery.

Image does not own asset fetching, fallback content, image failure policy, Avatar behavior, galleries, zoom/crop workflows, or another higher-level media experience. No Core runtime is introduced.

React offers a narrowly scoped convenience component at `@vyrnforge/react/image`: a typed, ref-forwarding native `img` with the same `data-vf-image` hook. Native Web still uses `img[data-vf-image]` directly, and `@vyrnforge/web/styles/image.css` remains the only styling implementation. The React component does not redefine image semantics or require other framework wrappers.
