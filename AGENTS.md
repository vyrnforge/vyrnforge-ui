# VyrnForge Repository Agent Rules

This file owns repository execution rules only. Product, package, component,
framework-support, release, and roadmap facts belong to their canonical sources.

## Required reading

Use the smallest authoritative source needed for the task:

1. `docs/governance/01-project-source-of-truth.md` for product identity and scope;
2. `docs/README.md` for documentation navigation;
3. `docs/governance/05-trunk-delivery.md` for branch, lane, CI, promotion, and synchronization flow;
4. `docs/architecture/01-package-boundaries.md` and package manifests for dependency boundaries;
5. `docs/metadata/components.json` for component catalog and maturity;
6. `docs/metadata/packages.json` plus release metadata for package/framework status;
7. `docs/api/` and package public entrypoints for public APIs;
8. `docs/quality/03-known-limitations.md` for current limitations;
9. the live VyrnForge progress tracker for active status, dependencies, acceptance criteria, and gates;
10. `docs/generated/ai-context/` for compact machine-readable consumer context.

Do not recreate those facts in this file or another hand-maintained mirror.

## Agent branch and delivery contract

Persistent lanes are peers. Route work by ownership:

- `integration/foundation` — shared foundations, contracts, tokens, metadata, generators, and framework-neutral logic;
- `integration/native` — Native HTML / Custom Elements and DOM-specific work;
- `integration/react` — React facade/package work;
- `integration/angular` — Angular facade/package work, including `@vyrnforge/ui-angular`;
- `integration/vue` — Vue facade/package work, including `@vyrnforge/ui-vue`;
- `integration/data-grid` — data-grid and optional data-management work;
- `integration/docs` — documentation application, guides, examples, and reader-facing documentation infrastructure;
- `integration/platform` — CI/CD, release tooling, repository automation, and developer tooling.

For normal implementation work:

1. start the short-lived task branch from the owning `integration/<lane>`;
2. open the task PR back to that same owning lane;
3. require selected CI responsibilities and `ci-gate` to pass;
4. promote completed lane work through an `integration/<lane>` -> `main` promotion PR;
5. require full repository validation and a green `ci-gate` before merging the promotion;
6. after shared changes land on `main`, synchronize affected consuming lanes before dependent work continues.

Do not create a normal task branch from `main`. Direct-to-`main` work is reserved
for an explicit emergency hotfix and still requires the full gate. Do not use
direct persistent-lane ref moves or force-pushes to bypass the documented task-PR
and promotion flow.

Repository-side agent behavior must follow this contract even when a host-level
protection setting is temporarily missing. Never use a missing protection rule
as permission to bypass the documented lane flow.

Framework lanes are equal first-class peers. React, Angular, Vue, and Native work
may proceed in parallel after shared prerequisites are satisfied. Serialize only
for a real technical or tracker dependency. When work spans lanes, keep reusable
shared work in its owning shared lane instead of hiding it in a framework branch.

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
npm run test
npm run build
npm run ci
```

When CI fails, inspect and fix the cause. Do not mark a task, promotion, or gate
complete until its acceptance criteria and required evidence pass.

If public behavior changes, update canonical metadata/API/package documentation
and generated outputs as required. Before deleting or moving reader-facing
material, check repository references and the docs route registry.

## Licensing

Repository licensing claims must match `LICENSE` and canonical commercial
licensing guidance. Do not broaden rights or describe the project as open source
unless the license itself changes.
