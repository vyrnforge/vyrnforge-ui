# VyrnForge UI - Documentation Usage Guide For AI

## Before Implementing

1. Read `.ai/AI_CONTEXT.md`.
2. Read `docs/README.md`.
3. Read the relevant package doc under `docs/packages/`.
4. Read the relevant public API doc under `docs/api/`.
5. Read `docs/metadata/` for structured component/package/status lookup.
6. Read architecture rules if changing state, styling, package boundaries, or framework support.

Before using a VyrnForge component, token, grid contract, or adapter, check API docs and metadata. Do not use undocumented internal APIs unless explicitly asked.

Keep current implemented state distinct from accepted future-target architecture. Package manifests and current metadata determine what exists now; accepted ADRs may define intended future topology.

## When Updating Docs

- Update the canonical owner instead of creating duplicates.
- Link important canonical guidance from `docs/README.md` or the appropriate section index.
- Keep executable inventories in code and generated inventories in their generators; do not copy them into Markdown.
- Update `docs/metadata/` and `.ai/COMPONENT_MAP.json` when their owned public component/API metadata changes.
- Keep AI docs concise and practical; link to canonical human docs rather than copying them.
- Add or update examples when public API behavior changes.
- Check `apps/docs/src/docsRegistry.ts` before moving or deleting a document consumed by the docs application.

## Cleanup And Retention

Follow `docs/governance/02-document-lifecycle.md`.

Archive replaced material only when it retains audit, migration, regression, or architectural value. Delete obsolete one-time prompts, stale task instructions, reproducible copies, pointer-only archives, and duplicate guidance when they have no continuing value. Git history remains the recovery path for ordinary deleted documentation.

Never remove required legal text, accepted ADR history, required release evidence, or verification evidence simply to reduce file count.

## When Unsure

Prefer:

- smaller API;
- native-first implementation;
- CSS variable theming;
- controlled state;
- adapter contracts;
- no new dependency;
- one canonical documentation owner per topic.
