# AGENTS.md - VyrnForge UI

## Project

VyrnForge UI is a native-first enterprise UI foundation. It includes:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-components`
- `@vyrnforge/ui-data-grid`

Do not treat this repository as only a data-grid project.

## Required Reading Before Work

1. `.ai/AI_CONTEXT.md`
2. `docs/README.md`
3. Relevant package doc under `docs/packages/`
4. Relevant public API doc under `docs/api/`
5. Relevant metadata under `docs/metadata/`
6. Relevant architecture doc under `docs/architecture/`

`docs/README.md` is the single documentation entrypoint. Do not create a competing source-of-truth document for project identity, package boundaries, state policy, styling, roadmap, or benchmarks.

## Forbidden Dependencies By Default

Do not add these unless explicitly approved:

- Redux / React Redux / RTK Query
- Zustand
- TanStack Table / Query / Virtual
- MUI / AntD / Chakra / Mantine
- Radix / Headless UI
- Tailwind
- styled-components / Emotion
- icon libraries
- CSS frameworks

## Package Boundaries

- `ui-core` must not depend on `ui-components` or `ui-data-grid`.
- `ui-components` must not depend on `ui-data-grid`.
- `ui-data-grid` may depend on `ui-core` and `ui-components`.

## Styling Rules

- Static styling belongs in CSS.
- TSX uses classes and dynamic CSS variables.
- Shared classes use `dv-*`.
- Grid classes use `udg-*`.
- Shared tokens use `--dv-*`.
- Grid variables use `--udg-*`.

## State Rules

- No global store inside VyrnForge packages.
- Use controlled/uncontrolled props.
- App owns backend rows, auth, permissions, and business workflows.
- Persistence/server/export use adapter contracts.

## Validation

Run after implementation changes:

```bash
npm run build
npm run typecheck
npm run test
npm run build:playground
```

For documentation-only changes, validate file placement, links, and `git diff --check`.

## Documentation

If public API changes, update:

- package README
- `docs/api/`
- docs index if needed
- metadata under `docs/metadata/`
- playground example
- AI docs if agent behavior changes

Before using a VyrnForge component, token, grid contract, or adapter, check `docs/api/` and `docs/metadata/`. Do not use undocumented internal APIs unless explicitly asked.

If documentation becomes outdated, move it to `docs/archive/<yyyy-mm-topic>/` with an archive note pointing to the replacement.
