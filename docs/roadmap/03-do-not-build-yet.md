# Do Not Build Yet

These items are intentionally deferred from the non-grid multi-framework beta.

| Avoid                                                        | Reason                                                                                                           |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Data-grid decomposition and performance expansion            | The grid remains a usable React alpha but must not delay the broader component beta.                             |
| Multi-framework data-grid renderers                          | Extract non-grid architecture and prove the renderer model first.                                                |
| Independent Angular component implementation                 | Angular consumes native elements; only thin integration adapters are allowed where needed.                       |
| Independent Vue component implementation                     | Vue consumes native elements; only thin `v-model` or typing adapters are allowed where needed.                   |
| Renaming `@vyrnforge/ui-components` to `@vyrnforge/ui-react` | Creates migration churn without improving the architecture boundary.                                             |
| Universal Shadow DOM                                         | Conflicts with enterprise theming, overrides, overlays, and existing CSS contracts; exceptions require approval. |
| Large Web Component runtime                                  | Violates the native-first, dependency-minimal direction unless proven necessary.                                 |
| React Native, Flutter, Android, or iOS renderer              | The current program is multi-framework web support, not cross-platform native rendering.                         |
| Charting package                                             | Not core to current VyrnForge positioning. Integrate external chart packages later.                              |
| Spreadsheet clone or BI pivot engine                         | Pulls the grid toward Excel/BI scope too early.                                                                  |
| Required Redux adapter                                       | Controlled props and framework-neutral controllers remain store-agnostic.                                        |
| Required Tailwind, MUI, Radix, or TanStack dependency        | Violates the approved dependency policy.                                                                         |
| Full XLSX/PDF generator inside grid                          | Apps or future dedicated packages own file generation.                                                           |

## Rule

Build only when the need appears across multiple real products or the capability
is foundational for the approved beta critical path. Architecture fixtures do
not justify a support claim; support requires versioned consumer evidence.
