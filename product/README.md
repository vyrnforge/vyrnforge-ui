# Product ownership

`product/` owns repository-only, framework-neutral product slices that span published packages. Today those slices are VyrnForge components.

Each `product/<component>/` directory may own shared component documentation, executable examples, accessibility mapping, cross-port/conformance evidence, real-browser evidence, and unreleased component change fragments. `component.json` owns small repository-facing product metadata such as documentation grouping; that metadata is discovered with the product slice and must not define runtime imports, public APIs, or component behavior.

Runtime implementation remains in the package that owns it, for example `packages/react/src/components/<component>/` or `packages/web/src/components/<component>/`. Package-local integration evidence remains under the owning package, for example `packages/react/test/components/<component>/`.

`product/` is not a package, runtime layer, component registry, or source of public import paths. Public package exports and conventional ownership are discovered automatically. Adding a normal component must not require adding its name to CI, docs routing, test selection, or a central tooling registry. Published packages must never depend on files under `product/`.
