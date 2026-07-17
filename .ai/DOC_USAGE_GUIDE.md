# VyrnForge UI - Documentation Usage Guide For AI

## Before Implementing

1. Read `.ai/AI_CONTEXT.md`.
2. Read `docs/README.md`.
3. Read the relevant package doc under `docs/packages/`.
4. Read the relevant public API doc under `docs/api/`.
5. Read `docs/metadata/` for structured component/package/status lookup.
6. Read architecture rules if changing state, styling, or package boundaries.

Before using a VyrnForge component, token, grid contract, or adapter, check API docs and metadata. Do not use undocumented internal APIs unless explicitly asked.

## When Updating Docs

- Update the canonical doc instead of creating duplicates.
- Link new docs from `docs/README.md`.
- Archive outdated docs under `docs/archive/<yyyy-mm-topic>/`.
- Update `docs/metadata/` and `.ai/COMPONENT_MAP.json` when public component/API metadata changes.
- Keep AI docs concise and practical.
- Add examples when public API changes.

## When Unsure

Prefer:

- smaller API
- native-first implementation
- CSS variable theming
- controlled state
- adapter contracts
- no new dependency
