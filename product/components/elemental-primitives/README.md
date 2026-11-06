# Layer 1 migration — ownership versus package source

`text`, `icon`, `surface`, `separator` and `visually-hidden` are the first Layer 1 components with nested product ownership. Their canonical component ID is the final directory segment, not the layer path.

The first three legacy Layer 1 migrations move owner-local metadata, examples, tests and change provenance from `product/<id>/` and project existing Web and framework implementation source into the new canonical unit. The legacy package-local implementation files are removed after their content is moved to canonical product units. Public package shells, `ng-package.json` secondary-entrypoint metadata, type/evidence files and consumer-facing exports remain intact. Package staging projects the canonical component source to unchanged public entrypoints.

Physical ownership alone does not prove a reusable component is mature. Confirm `migration.state`, `authoringMode`, public package artifacts, SSR, Native Web browser accessibility and release impact before acceptance. Component styling and public APIs are deliberately unchanged in this source-ownership migration.
