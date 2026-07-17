# Codex Prompt - Documentation Cleanup And Unification

Use this prompt after copying the documentation system into the repo.

```txt
You are working inside the VyrnForge UI repository.

Task:
Unify and clean the project documentation so there is no duplicate or conflicting direction.

Important:
- Do not modify package implementation in this task.
- Do not add dependencies.
- Do not delete old docs immediately unless they are exact duplicates and safely replaced.
- Prefer archiving outdated docs under docs/archive/.
- Preserve benchmark docs and any useful history.

Goal:
Make docs/README.md the canonical documentation index and align all docs with the VyrnForge UI direction.

Required work:

1. Ensure these docs exist and are linked from docs/README.md:
- docs/governance/00-documentation-governance.md
- docs/governance/01-project-source-of-truth.md
- docs/architecture/00-system-overview.md
- docs/architecture/01-package-boundaries.md
- docs/architecture/02-state-and-adapter-ownership.md
- docs/architecture/03-theming-and-styling.md
- docs/roadmap/00-master-roadmap.md
- docs/roadmap/01-component-inventory.md
- docs/packages/ui-core.md
- docs/packages/ui-components.md
- docs/packages/ui-data-grid.md
- docs/react-docs/00-react-docs-app-spec.md
- .ai/AI_CONTEXT.md
- AGENTS.md

2. Scan existing docs for duplication around:
- project identity
- package boundaries
- state/Redux policy
- styling/theme rules
- roadmap/sprint plans
- data-grid-only positioning

3. For duplicate docs:
- keep the newest/canonical content
- move outdated versions to docs/archive/<topic>/
- add archive note pointing to replacement doc

4. Update root README.md to point to:
- docs/README.md
- AGENTS.md
- .ai/AI_CONTEXT.md

5. Ensure AI docs are concise and aligned with package boundaries.

6. Do not create a second roadmap or competing source-of-truth doc.

Acceptance criteria:
- docs/README.md is the single documentation entrypoint.
- Old conflicting docs are archived or clearly marked deprecated.
- Project direction is consistently VyrnForge UI, not data-grid-only.
- AI files exist and are aligned with human docs.
- No implementation code was changed.
```
