# Do Not Build Yet

These items remain intentionally outside the current VyrnForge roadmap unless a
new approved requirement or measured need changes the priority.

| Avoid                                                             | Reason                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Broad data-grid decomposition without a dedicated plan            | The grid is a separate React alpha workstream and should not redefine the shared UI foundation.                           |
| Multi-framework data-grid renderers                               | Non-grid renderer support does not imply grid parity; additional grid renderers need their own architecture and evidence. |
| Independent Angular component implementation                      | Angular consumes the native renderer; thin integration adapters are preferred.                                            |
| Independent Vue component implementation                          | Vue consumes the native renderer; thin model/typing adapters are preferred.                                               |
| Renaming `@vyrnforge/ui-components` to `@vyrnforge/ui-react`      | Creates migration churn without improving package ownership.                                                              |
| Universal Shadow DOM                                              | Conflicts with current enterprise styling and interoperability defaults; exceptions require explicit approval.            |
| Large required Web Component runtime                              | Conflicts with the native-first, dependency-minimal architecture unless clearly justified.                                |
| React Native, Flutter, Android, or iOS renderer                   | Mobile-native rendering is outside the current web support model.                                                         |
| Built-in charting platform                                        | Not part of the current UI foundation scope.                                                                              |
| Spreadsheet clone or BI pivot engine                              | Pulls the grid into a different product category.                                                                         |
| Required Redux/Zustand/NgRx/Pinia integration                     | VyrnForge remains application-store agnostic.                                                                             |
| Required Tailwind, MUI, Radix, TanStack, or similar UI dependency | Conflicts with dependency-minimal portability.                                                                            |
| Full XLSX/PDF generation inside the grid                          | File generation remains an application or dedicated-package concern.                                                      |

## Rule

Build new reusable surface area only when it solves a repeated product need,
fits existing package boundaries, and cannot be satisfied by extending current
VyrnForge foundations.
