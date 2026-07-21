# Component Quality Remediation Plan

Q1 pauses feature expansion and stabilizes the existing surface. This plan is a remediation checklist, not a competing roadmap.

## Immediate Q1 Scope

| Priority | Work | Status |
| --- | --- | --- |
| P0/P1 | Fix crashes, unusable keyboard paths, focus trap failures, broken controlled state, or major scroll defects. | No confirmed P0/P1 found in this pass. |
| P1 | Withdraw unstable components from stable recommendation if they cannot be fixed safely. | New and partially covered components remain experimental. |
| P2 | Add a playground quality matrix for visual and interaction review. | Added. |
| P2 | Align playground badges with component status metadata. | Added for mature action/feedback controls. |
| P2 | Document known limitations so production use is not overstated. | Added. |
| P3 | Add browser-level tests for overlay focus, combobox keyboard navigation, toast timers, and long-scroll layouts. | Planned follow-up. |

## Recommended Next Hardening Order

| Order | Area | Reason |
| --- | --- | --- |
| 1 | Overlay focus and dismissal | Dialog, Drawer, Popover, Menu, Dropdown, Tooltip, Toast, and Autocomplete share this risk surface. |
| 2 | Form controlled/uncontrolled contracts | Field, RadioGroup, Switch, NumberInput, Rating, Slider, Autocomplete, and TransferList are core to enterprise workflows. |
| 3 | AppShell and navigation scrolling | Long admin sidebars and sticky headers are high-visibility production surfaces. |
| 4 | Data grid scroll/sticky behavior | The grid is stable, but sticky and horizontal overflow are browser-sensitive. |
| 5 | Visual density sweep | Compact, standard, and comfortable modes should be reviewed as a set. |

## Do Not Build During Q1

- New component families
- Server mode
- Saved views
- Export UI panels
- Advanced filtering UI
- New styling frameworks
- New state libraries
- New overlay or positioning dependencies

## Test Hardening Targets

| Area | Target tests |
| --- | --- |
| Tabs | ArrowRight, ArrowLeft, Home, End, disabled tab skip, controlled callback. |
| Dialog / Drawer | Initial focus, trapped Tab, Escape dismissal, focus restoration, long body scroll. |
| Autocomplete | Arrow navigation, disabled option skip, Enter select, Escape restore, `aria-activedescendant`. |
| TransferList | Select visible, disabled option skip, move selected/all, hidden submission values. |
| Toast | duplicate id update, dismiss, persistent duration, pause/resume on hover and focus. |
| AppShell / SideNav | long sidebar scroll, content scroll, fixed/sticky header offsets, narrow layout. |
| Data grid | sticky header, horizontal overflow, selection, pagination, empty/error/loading states. |

## Production Recommendation Rule

Only mark a component `stable` when:

1. API, accessibility, visual, docs, metadata, playground, and tests agree.
2. There is no known P0/P1 limitation.
3. Known P2/P3 issues have acceptable workarounds.
4. The status is correct in canonical `docs/metadata/components.json`; package docs and presentation views consume or accurately describe that record.
