# Layout

VyrnForge layout primitives each own one distinct job:

- **Container** constrains page or section content width, centers it, and applies logical inline gutters.
- **Stack** arranges related children in block flow with shared spacing, alignment, and justification.
- **Cluster** arranges related children in inline flow and wraps them when space runs out.

All three consume the public VyrnForge spacing scale and the canonical CSS implementation from `@vyrnforge/web`.

Grid and Box remain intentionally deferred. Grid needs a separately validated intrinsic sizing contract. Box will only be introduced if it can own a meaningful cross-framework responsibility beyond exposing generic CSS properties.
