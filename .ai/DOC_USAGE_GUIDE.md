# Dravyn UI - Documentation Usage Guide For AI

## Before Implementing

1. Read `.ai/AI_CONTEXT.md`.
2. Read `docs/README.md`.
3. Read the relevant package doc under `docs/packages/`.
4. Read architecture rules if changing state, styling, or package boundaries.

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
