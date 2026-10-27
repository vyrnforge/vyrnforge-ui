# Token tooling

`tooling/tokens/` owns repository-internal token source loading, deterministic transformation, rendering, and generation checks used to keep generated token artifacts synchronized with the shared design-token contract.

Keep transformation and generation mechanics here. Runtime token consumption, generated browser CSS, package exports, and framework integration belong to their owning packages. This capability must not become a second design-token source of truth or a home for framework-specific styling behavior.
