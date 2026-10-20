# Layout

The initial VyrnForge layout foundation provides two deliberately small primitives:

- **Container** constrains content width, centers it, and applies logical inline gutters.
- **Stack** arranges children along one logical axis with shared spacing, alignment, and justification.

Both primitives consume the public VyrnForge spacing scale and the canonical CSS implementation from `@vyrnforge/web`.

Grid, Inline/Cluster, and Box are intentionally deferred until real composition needs establish their contracts. Layout does not introduce a general style-prop runtime or a viewport-breakpoint prop matrix.
