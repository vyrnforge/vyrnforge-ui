# Image

Image is the native-backed treatment inside the Layer 1 Media family.

## Native baseline

Use a native `img` element. VyrnForge augments it with responsive presentation only; browser semantics and authored attributes remain authoritative.

Native HTML continues to own alternative text, resource/source selection, intrinsic dimensions, loading, decoding, fetch priority, referrer/CORS policy, and load/error behavior.

## Accessibility

Authors provide context-appropriate alternative text, including an empty `alt` for decorative images where appropriate. VyrnForge does not infer meaning, invent hidden labels, add focusability, or replace native image semantics.

## Native Web

Load `@vyrnforge/web/styles/image.css` and apply `data-vf-image` directly to the native `img` element.

```html
<img
  data-vf-image
  src="/artwork/example.webp"
  alt="Example artwork"
  width="640"
  height="320"
  loading="lazy"
  decoding="async"
  fetchpriority="low"
/>
```

Framework-specific Image wrappers are not required merely for symmetry. Higher-level fallback, gallery, zoom, crop, or asset-loading behavior belongs elsewhere.
