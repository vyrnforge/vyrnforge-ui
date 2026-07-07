# 12 — Codex Master Implementation Prompt

Use this prompt when you want Codex to understand the full Dravyn UI project direction.

```txt
You are working inside the Dravyn UI repository.

Project name:
Dravyn UI.

Project purpose:
Build a native-first enterprise UI component system for reusable application components across IAM, ITAM, ITSM, Atlas, Gateway UI, admin portals, customer portals, and reporting screens.

Current strategic component:
UniversalDataGrid in packages/ui-data-grid.

Long-term packages:
- packages/ui-core
- packages/ui-components
- packages/ui-data-grid

Native-first constraints:
- Do not add MUI.
- Do not add TanStack.
- Do not add Redux as internal dependency.
- Do not add Tailwind.
- Do not add Radix.
- Do not add Headless UI.
- Do not add icon libraries.
- Do not add CSS frameworks.
- Do not add runtime dependencies without strong justification.
- Prefer React, TypeScript, native HTML, scoped CSS, and CSS variables.

Design direction:
- Enterprise SaaS quality.
- Compact but readable.
- Light/dark/enterprise theme support.
- Density support.
- CSS variable customization.
- Accessible interactions.
- No decorative UI.
- No domain-specific assumptions.

Data grid current capabilities:
- native rendering
- search
- sorting
- pagination
- filtering
- column visibility
- column order
- persistence
- theme system
- resizing
- progressive header controls
- row selection
- bulk actions
- grouping

Remaining roadmap:
- P6 server mode and lazy placeholders
- P7 export request contract
- P8 saved views manager
- P9 advanced filter drawer
- P10 performance and optional virtualization
- P11 accessibility and QA hardening
- P12 release preparation

Broader UI roadmap:
- UI-0 docs and inventory
- UI-1 create ui-core
- UI-2 extract theme tokens and shared utilities
- UI-3 create ui-components
- UI-4 implement action, feedback, and form primitives
- UI-5 optionally refactor ui-data-grid to consume shared primitives
- UI-6 playground/story documentation
- UI-7 release and version packages

Implementation rules:
- Keep package APIs typed.
- Support controlled and uncontrolled modes.
- Prefer adapter-based integrations.
- Do not store row data in persistence.
- Do not force global state libraries.
- Keep behavior testable through pure utility functions.
- Maintain playground examples.
- Run build, typecheck, test, and playground build after changes.

Validation commands:
- npm run build
- npm run typecheck
- npm run test
- npm run build:playground
```
