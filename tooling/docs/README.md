# Documentation tooling

`tooling/docs/` owns reusable repository automation for building, compiling, serving, and exercising the documentation system. It may integrate owner-local product examples and documentation metadata, but it does not own those product contracts or the docs application's presentation and content.

Keep documentation build orchestration, reusable example integration, registry plumbing, serving helpers, and docs-browser launch support here when they are shared repository concerns. Application-specific tests, routes, styles, and presentation evidence belong under `apps/docs/`; component documentation contracts and examples belong with their product owner.
