# VyrnForge Repository Agent Rules

This file owns repository execution rules only. Product, package, component,
framework-support, release, and roadmap facts belong to their canonical sources.

## Required reading

Use the smallest authoritative source needed for the task:

1. `docs/governance/01-project-source-of-truth.md` for product identity and scope;
2. `docs/README.md` for documentation navigation;
3. `docs/governance/05-trunk-delivery.md` for branching, PR topology, CI, merge, and delivery flow;
4. `docs/architecture/01-package-boundaries.md` and package manifests for dependency boundaries;
5. `docs/metadata/components.json` for component catalog and maturity;
6. `docs/metadata/packages.json` plus release metadata for package/framework status;
7. `docs/api/` and package public entrypoints for public APIs;
8. `docs/quality/03-known-limitations.md` for current limitations;
9. the live VyrnForge progress tracker for active status, dependencies, acceptance criteria, and gates;
10. `docs/generated/ai-context/` for compact machine-readable consumer context.

Do not recreate those facts in this file or another hand-maintained mirror.

## Agent branch and delivery contract

`main` is the canonical releasable branch. Normal work uses short-lived branches.
A PR may target `main` directly or, when a real prerequisite exists, another
short-lived prerequisite branch. Temporary `integration/<initiative>` branches
are allowed only for bounded initiative integration and must not become a
permanent promotion lane or alternate `develop` branch.

For normal implementation work:

1. start from current `main` unless the task explicitly depends on an unmerged prerequisite;
2. keep the branch scoped to one coherent change or dependency layer;
3. use a mainline PR when the change is independently valid;
4. use a stacked PR only when the dependency is real and record the dependency and retarget plan;
5. run enough validation for non-mainline review, then require the full protected mainline gate before the change reaches `main`;
6. remove completed short-lived or integration branches after their purpose ends.

Do not push normal work directly to `main`, force-push protected history, or use
direct ref moves to bypass the pull-request boundary. Never use a missing host
protection rule as permission to bypass the documented protected-main flow.

Native HTML / Custom Elements, React, Angular, and Vue are equal first-class
framework tracks. Independent framework work may proceed in parallel after shared
prerequisites are satisfied. Serialize only for a real technical or tracker
dependency.

## Implementation rules

- Reuse or extend existing VyrnForge components, primitives, behaviors, tokens,
  contracts, schemas, generators, utilities, patterns, and packages before
  creating one-off UI.
- Solve cross-framework behavior once in shared foundations where practical,
  then expose idiomatic Native HTML / Custom Elements, React, Angular, and Vue
  adapters.
- Keep framework-specific exceptions narrow, explicit, traceable, and tested.
- Keep core packages independent of consuming-application state management,
  routing, authorization, persistence, backend fetching, and business logic.
- Do not add large UI, styling, table/query, or state-management ecosystems as
  required foundations without explicit approval.
- Use VyrnForge design tokens and CSS custom properties as the shared styling
  foundation; do not create parallel framework-specific design systems.
- Treat accessibility, keyboard/focus behavior, internationalization,
  responsive behavior, SSR/server-safe imports, compatibility, migration, and
  performance as product requirements.
- Prefer public-entrypoint, packed-package, and real-consumer verification over
  tests that prove only repository-internal imports.
- Keep documentation concise and source-of-truth oriented. Update the canonical
  owner instead of adding another summary when the information already exists.

## Validation and completion

Use targeted checks while implementing and the current root validation commands
when appropriate:

```bash
npm run check
npm test
npm run build
npm run ci
```

When CI fails, inspect and fix the cause. Do not mark a task, maturity promotion,
or gate complete until its acceptance criteria and required evidence pass.

If public behavior changes, update canonical metadata/API/package documentation
and generated outputs as required. Before deleting or moving reader-facing
material, check repository references and the docs route registry.

## Licensing

Repository licensing claims must match `LICENSE` and canonical commercial
licensing guidance. Do not broaden rights or describe the project as open source
unless the license itself changes.
