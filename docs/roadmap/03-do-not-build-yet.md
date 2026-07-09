# Do Not Build Yet

These items are intentionally deferred.

| Avoid | Reason |
| --- | --- |
| Charting package | Not core to current Dravyn positioning. Integrate external chart packages later. |
| Spreadsheet clone features | Pulls grid toward AG Grid/Excel scope too early. |
| BI pivot engine | Too broad and not aligned with enterprise UI foundation phase. |
| Required Redux adapter | Controlled props already support Redux integration. Wait for repeated pain. |
| Required Tailwind/MUI/Radix/TanStack dependency | Violates native-first dependency-minimal policy. |
| Full XLSX/PDF export generator inside grid | Grid should emit export requests; apps/future packages can generate files. |
| Large workflow suite before app shell/forms | Workflow components need repeated real product use cases. |
| Complex combobox before simple form completion | Build stable native form primitives first. |
| Full positioning engine | Improve overlay robustness incrementally first. |

## Rule

Build only when the need appears in multiple real use cases or the component is foundational enough that other components depend on it.
