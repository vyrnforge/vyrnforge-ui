# Do Not Build Yet

These items remain intentionally outside the current VyrnForge roadmap unless a
new approved requirement, architecture decision, and measured need changes the
priority.

"Do not build yet" is a scheduling and architecture guard, not necessarily a
permanent product-scope exclusion.

| Avoid                                                                            | Reason                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Broad data-grid decomposition without a dedicated plan                           | The grid is a separate React alpha workstream and should evolve through its own optional advanced-module architecture and evidence.                                                                    |
| Multi-framework data-grid renderers without a dedicated program                  | First-class non-grid framework support does not automatically imply current grid parity; additional grid renderers require architecture, performance, accessibility, packaging, and consumer evidence. |
| Independent Angular design-system/component implementation                       | Angular is a first-class support target, but shared VyrnForge semantics and canonical implementations should be reused through generated/thin integration unless an ADR-008 exception is justified.    |
| Independent Vue design-system/component implementation                           | Vue is a first-class support target, but shared VyrnForge semantics and canonical implementations should be reused through generated/thin integration unless an ADR-008 exception is justified.        |
| Renaming `@vyrnforge/ui-components` to `@vyrnforge/ui-react` solely for symmetry | Creates migration churn without improving package ownership or consumer DX.                                                                                                                            |
| Universal Shadow DOM                                                             | Conflicts with current styling/interoperability defaults; component-level exceptions require explicit technical evidence and a public styling contract.                                                |
| Large required Web Component runtime                                             | Conflicts with native-owned, dependency-minimal portability unless an approved capability demonstrates that the tradeoff is necessary.                                                                 |
| React Native, Flutter, Android, or iOS renderer                                  | Mobile-native rendering is outside the current web support program and requires a separate product/architecture decision.                                                                              |
| Charting/visualization implementation before module architecture                 | Visualization UI is valid long-term VyrnForge scope, but implementation should wait for an approved optional-module, rendering/dependency, accessibility, and framework-integration design.            |
| Tree/TreeGrid implementation as an isolated one-off                              | Hierarchical UI should first reuse or extend shared collection, selection, keyboard, accessibility, lazy-data, and performance contracts.                                                              |
| Workflow/diagram editor implementation before responsibility boundaries          | VyrnForge may own reusable editor UI, but it must not silently become a workflow execution/runtime engine.                                                                                             |
| 3D/spatial UI implementation before boundary and adapter design                  | VyrnForge may own reusable spatial UI controls, but it should not become a rendering/game engine or force heavyweight graphics dependencies on normal consumers.                                       |
| Spreadsheet clone or BI pivot/calculation engine                                 | This is a separate product/runtime category. VyrnForge may provide data/visualization UI without owning spreadsheet or BI calculation semantics.                                                       |
| Required Redux/Zustand/NgRx/Pinia integration                                    | VyrnForge remains application-store agnostic.                                                                                                                                                          |
| Required Tailwind, MUI, Radix, TanStack, Ant Design, or similar UI dependency    | Conflicts with native-owned dependency-minimal portability.                                                                                                                                            |
| Full XLSX/PDF generation inside the grid or shared UI packages                   | File-generation engines remain application or dedicated-integration concerns unless a separately approved package demonstrates a reusable need.                                                        |
| Hand-maintained AI documentation that duplicates canonical contracts             | AI context must derive from canonical component/pattern metadata so human docs, framework generation, and machine context cannot drift independently.                                                  |

## Valid future scope versus permanent non-goals

The following are valid future UI capability families when justified and
properly modularized:

- charting and visualization UI;
- tree and tree-grid UI;
- advanced forms and reusable form patterns;
- workflow/diagram editor UI;
- dashboard and application composition patterns;
- rich editors and advanced interaction surfaces;
- spatial/3D UI controls and overlays.

Their associated business/runtime engines remain outside VyrnForge unless a
future explicit product decision says otherwise.

## Rule

Build new reusable surface area only when it solves a repeated product need,
fits or deliberately extends approved package boundaries, reuses existing
VyrnForge foundations where practical, and has an evidence-backed distribution
and maintenance model.

During S10-S15, prioritize completion of the approved multi-framework
distribution program over starting unrelated advanced-module implementation.
