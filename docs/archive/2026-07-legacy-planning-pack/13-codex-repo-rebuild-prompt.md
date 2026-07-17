> Archived: This document is historical and no longer canonical.
> Replacement: ../../../.ai/AI_CONTEXT.md and ../../prompts/

# 13 — Codex Repo Rebuild Prompt

Use this prompt to rebuild and align repository documentation around the VyrnForge UI project name and broader component-system direction.

```txt
You are working inside the current DATA-GRID repository.

Task:
Rebuild the project documentation to reflect the new project direction and name: VyrnForge UI.

Important:
- This is documentation and repository-alignment work first.
- Do not rewrite the working UniversalDataGrid implementation unless explicitly required.
- Do not add new runtime dependencies.
- Do not break build scripts.
- Do not remove existing docs unless replacing them with clearer updated docs.
- Preserve the native-first direction.

New project identity:
- Project name: VyrnForge UI
- Repository name recommendation: vyrnforge-ui
- Package namespace recommendation: @dravyn
- Main package: @dravyn/ui-data-grid
- Future packages:
  - @dravyn/ui-core
  - @dravyn/ui-components

Goal:
Update the documentation so the project is no longer described only as a data-grid package. The data grid remains the first strategic component, but the long-term project is a native-first enterprise UI component system.

Create or update docs with the following structure:

docs/
  00-project-charter.md
  01-naming-and-brand-system.md
  02-repository-and-package-architecture.md
  03-native-first-engineering-principles.md
  04-theme-system-spec.md
  05-component-system-roadmap.md
  06-universal-data-grid-spec.md
  07-data-grid-state-and-api-contract.md
  08-data-grid-implementation-roadmap.md
  09-build-release-upgrade-strategy.md
  10-playground-and-documentation-strategy.md
  11-quality-accessibility-test-strategy.md
  12-codex-master-implementation-prompt.md
  13-codex-repo-rebuild-prompt.md

Documentation requirements:

1. Project charter
Explain VyrnForge UI as a native-first enterprise UI foundation for IAM, ITAM, ITSM, Atlas, Gateway UI, admin portals, customer portals, and reporting screens.

2. Naming system
Document VyrnForge UI as the chosen name.
Explain dragon-inspired naming without making components overly fantasy-themed.
Recommend package namespace @dravyn.
Recommend packages @dravyn/ui-core, @dravyn/ui-components, @dravyn/ui-data-grid.

3. Package architecture
Document package boundaries:
- ui-core for theme/tokens/utilities
- ui-components for generic reusable components
- ui-data-grid for the UniversalDataGrid and data management behavior

4. Native-first principles
Document that the project should avoid required dependencies such as MUI, TanStack, Redux, Tailwind, Radix, Headless UI, Emotion, styled-components, icon libraries, and CSS frameworks.

5. Theme system
Document CSS variable theme architecture, light/dark/system/enterprise themes, density, variants, and themeVars.

6. Component roadmap
List future components by category:
- Foundation
- Layout
- Actions
- Forms
- Overlays
- Feedback
- Data Display
- Navigation
- Data Management
- Workflow

7. Data grid spec
Document current and planned data grid capabilities.

8. State/API contract
Document key DataGridState, column, filter, selection, grouping, persistence, server query, and export request contracts.

9. Implementation roadmap
Document completed phases and remaining phases:
- P6 server mode
- P7 export request
- P8 saved views
- P9 advanced filter drawer
- P10 performance/virtualization
- P11 QA/accessibility
- P12 release prep

10. Build/release strategy
Document versioning, npm pack testing, private registry strategy, changelog, migration guide, CI, and dependency policy.

11. Playground/documentation strategy
Document basic playground, data grid playground, and future component playground.

12. Quality/accessibility/test strategy
Document build, test, accessibility, visual QA, and interaction conflict checklists.

13. Codex master prompt
Include a reusable master prompt that gives future Codex sessions the full project context.

Acceptance criteria:
- Docs are complete and readable.
- Docs use VyrnForge UI naming consistently.
- Docs explain that the data grid is the first strategic component, not the whole project.
- Docs preserve native-first direction.
- Docs define package boundaries and future UI system roadmap.
- Existing package implementation is not broken.
- No forbidden dependencies are added.
- npm run build, npm run typecheck, npm run test, and npm run build:playground still pass if they were passing before.
```
