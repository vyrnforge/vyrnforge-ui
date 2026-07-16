# Known Component Limitations

This document is intentionally candid. Remaining P2/P3 issues should be visible so teams do not overstate component maturity.

| Component | Limitation | User impact | Workaround | Planned remediation phase | Production use recommended |
| --- | --- | --- | --- | --- | --- |
| ButtonGroup | Group semantics are layout-oriented and do not imply a selected value. | Users may mistake attached buttons for selection controls if copy is unclear. | Use SegmentedControl, Tabs, RadioGroup, or ToggleButtonGroup for selection. | Q1 hardening | Yes, for simple grouped actions. |
| ToggleButton / ToggleButtonGroup | Needs broader browser keyboard and disabled-child coverage. | Edge cases around tool groups may be missed by SSR tests. | Keep groups small and test keyboard operation in consuming apps. | Q1 hardening | Use cautiously. |
| Field and native form controls | Browser-native validation and picker UI varies by browser. | Date/number editing can look different across platforms. | Use clear labels, min/max/step guidance, and app-level validation. | Q1/Q2 | Yes, experimental. |
| MultiSelect | Keyboard and search behavior is less mature than Autocomplete. | Complex multi-value workflows may feel limited. | Use Checkbox groups, TransferList, or app-specific pages for complex cases. | Q1 hardening | Use cautiously. |
| Autocomplete | Browser-level combobox tests are still needed. | Edge keyboard/focus cases may not be fully covered by automated tests. | Keep option sets bounded and manually test keyboard flows. | Q1 hardening | Use cautiously. |
| TransferList | Not virtualized and intended for moderate local collections. | Very large lists can become slow or hard to scan. | Use UniversalDataGrid or app-owned server pagination for large collections. | Q2 if demand proves real | Yes for bounded local assignment. |
| Toast | Timer pause/resume is not yet covered by a browser timer interaction test. | Rare timer edge cases may require manual verification. | Use persistent duration for critical messages, and keep critical feedback inline. | Q1 hardening | Yes for transient feedback. |
| AppShell / SideNav / TopNav | Long navigation and sticky header behavior needs continued browser review. | Misconfigured apps can create double scrollbars or clipped nav. | Use AppShell props instead of app-specific scroll wrappers and test long content. | Q1 hardening | Yes, experimental. |
| Page / PageHeader / PageToolbar | Responsive wrapping patterns need more examples. | Dense action bars may wrap awkwardly in narrow widths. | Use concise actions and move secondary actions into menus. | Q1/Q2 | Yes, experimental. |
| Tabs | Browser keyboard tests should be expanded. | Current source supports arrow/Home/End, but automation is mostly SSR-level. | Manually test keyboard navigation in consuming apps. | Q1 hardening | Yes, experimental. |
| Overlays | Focus restoration, nested overlays, and long content need browser automation. | Complex nested overlay flows may expose focus or scroll edge cases. | Prefer simple overlay compositions; use Overlay Stress playground page for checks. | Q1 hardening | Yes for documented patterns. |
| UniversalDataGrid | Sticky header and horizontal overflow remain browser-sensitive. | Complex layouts can require local scroll verification. | Use playground stress pages before shipping new grid layouts. | Q1 hardening | Yes. |

## No Known P0/P1

No remaining P0/P1 component limitations are documented after this pass. If a P0/P1 is found, fix it immediately or move the affected component out of stable recommendation.
