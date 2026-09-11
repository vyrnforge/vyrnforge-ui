# VyrnForge Repository Agent Rules

This file contains repository execution rules only. It is not a second source of
product, package, component, framework-support, release, or roadmap truth.

## Canonical sources

Use the smallest authoritative source that owns the question:

- product identity and durable scope: `docs/governance/01-project-source-of-truth.md`;
- documentation navigation: `docs/README.md`;
- repository shape: `docs/governance/repository-inventory.md`;
- branch, lane, CI, and promotion flow: `docs/governance/05-trunk-delivery.md`;
- package boundaries: `docs/architecture/01-package-boundaries.md` and package manifests;
- package/framework status: `docs/metadata/packages.json` and release metadata;
- component catalog and maturity: `docs/metadata/components.json`;
- public APIs: `docs/api/` and package public entrypoints;
- current limitations: `docs/quality/03-known-limitations.md`;
- active task status, dependencies, acceptance criteria, and gates: the live VyrnForge progress tracker;
- compact machine context: `docs/generated/ai-context/`.

Do not recreate those facts in this file or in another hand-maintained mirror.

## Execution rules

1. Inspect the relevant canonical sources, existing implementation, tests, and
   tracker dependencies before changing architecture or public APIs.
2. Reuse or extend existing VyrnForge components, primitives, behaviors, tokens,
   contracts, schemas, generators, utilities, patterns, and packages before
   creating one-off UI.
3. Solve cross-framework behavior once in shared foundations where practical,
   then expose idiomatic framework adapters. Native HTML / Custom Elements,
   React, Angular, and Vue are equal first-class supported surfaces.
4. Keep framework-specific exceptions narrow, explicit, traceable, and tested.
5. Keep core packages independent of consuming-application state management,
   routing, authorization, persistence, backend fetching, and business logic.
6. Do not add large UI, styling, table/query, or state-management ecosystems as
   required VyrnForge foundations without explicit approval.
7. Use VyrnForge design tokens and CSS custom properties as the shared styling
   foundation. Avoid framework-specific parallel design systems and hard-coded
   visual values when a shared semantic token exists or should exist.
8. Treat accessibility, keyboard/focus behavior, internationalization,
   responsive behavior, SSR/server-safe imports, compatibility, migration, and
   performance as product requirements.
9. Prefer public-entrypoint, packed-package, and real-consumer verification over
   tests that only prove repository-internal imports.
10. Keep documentation concise and source-of-truth oriented. Update the canonical
    owner instead of adding another summary when the information already exists.

## Delivery flow

Follow `docs/governance/05-trunk-delivery.md` exactly.

For normal work:

1. identify the owning persistent `integration/*` lane;
2. branch from that lane;
3. open the task PR back to the same lane;
4. require the selected CI responsibilities and `ci-gate` to pass;
5. promote completed lane work to `main` through an integration-lane-to-main PR;
6. require the full main-boundary gate before merge;
7. after shared changes land, synchronize consuming lanes from `main` before
   building dependent work.

Persistent framework lanes are peers. Do not serialize React, Angular, Vue, or
Native work unless a real technical or tracker dependency requires it. Do not
use direct-to-`main` changes, direct persistent-lane ref moves, or force-pushes
to bypass the documented flow.

When work spans ownership lanes, separate reusable shared work from independent
framework adaptations when practical. Do not hide shared architecture changes in
a framework-specific branch.

## Validation and completion

Use targeted checks while implementing and the repository's current root
validation commands when appropriate:

```bash
npm run check
npm run test
npm run build
npm run ci
```

When CI fails, inspect and fix the cause. Do not mark a task, promotion, or gate
complete until its acceptance criteria and required evidence pass.

If public behavior changes, update its canonical metadata/API/package
documentation and generated outputs as required. Before deleting or moving a
reader-facing document, check repository references and the docs route registry.

## Licensing

Repository licensing claims must match `LICENSE` and the canonical commercial
licensing guidance. Do not broaden rights or describe the project as open source
unless the license itself changes.
