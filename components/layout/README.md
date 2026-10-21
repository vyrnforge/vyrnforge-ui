# Layout

VyrnForge layout primitives each own one distinct job:

- **Container** constrains page or section content width, centers it, and applies logical inline gutters.
- **Stack** arranges related children in block flow with shared spacing, alignment, and justification.
- **Cluster** arranges related children in inline flow and wraps them when space runs out.
- **Grid** arranges repeated peers in equal flexible tracks that reflow intrinsically from available space.

All four consume the public VyrnForge spacing scale and the canonical CSS implementation from `@vyrnforge/web`.

Grid deliberately does not model the full CSS Grid platform. Its JavaScript/framework API exposes only `gap`; consumers customize the shared `--vf-grid-min-item-size` CSS token when repeated items need a different minimum width. Explicit column counts, named areas, item placement, alignment, and breakpoint-specific layouts remain ordinary CSS.

Box remains intentionally deferred. It will only be introduced if it can own a meaningful cross-framework responsibility beyond exposing generic CSS properties.
