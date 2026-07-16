# Current Component Quality Audit

Audit date: 2026-07-16.

Scope reviewed:

- `@dravyn/ui-components` public exports
- `@dravyn/ui-data-grid` public exports
- component metadata and status metadata
- playground reference routes
- current SSR/unit coverage for component contracts

This audit does not claim exhaustive browser assistive-technology verification. Browser-only focus, hover, and scroll behavior that is not yet covered by automated tests remains listed as a limitation.

## Summary

| Area | Result |
| --- | --- |
| Confirmed P0 issues | None found in the inspected source surface. |
| Confirmed P1 issues | None found in the inspected source surface. |
| Highest current risk | New composite controls and overlays need more browser-level keyboard/focus testing before stable promotion. |
| Status correction | Stable badges should only be used where metadata, docs, route examples, and tests agree. Newer controls remain experimental. |
| Remediation this pass | Added quality docs, quality script, and a playground component quality matrix. Aligned stable playground badges for mature action/feedback controls. |

## Component Audit Matrix

Legend: `Pass` meets the current gate for its maturity, `Partial` is usable but needs hardening, `Gap` needs follow-up before stable use.

| Component | Package | Status | API | A11y | Visual | Tests | Docs | Severity | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Button | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; maintain live examples and loading/disabled tests. |
| IconButton | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; continue requiring accessible names. |
| ToolbarButton | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; verify compact toolbar focus in browser. |
| ButtonGroup | ui-components | experimental | Pass | Partial | Pass | Pass | Partial | P2 | Keep experimental until grouped action guidance is fuller. |
| SegmentedControl | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; add browser arrow-key tests later. |
| ToggleButton | ui-components | experimental | Pass | Pass | Pass | Pass | Partial | P2 | Keep experimental; broaden keyboard/group tests. |
| ToggleButtonGroup | ui-components | experimental | Pass | Partial | Pass | Pass | Partial | P2 | Keep experimental; harden roving focus and disabled child cases. |
| Icon | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; do not add external icon dependency. |
| Typography primitives | ui-components | stable | Pass | Pass | Pass | Partial | Pass | P3 | Keep stable; add spot tests for semantic `as` usage if needed. |
| Field | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental until more form compositions are browser-tested. |
| TextInput | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native behavior is sound. |
| SearchInput | ui-components | experimental | Pass | Pass | Pass | Partial | Partial | P2 | Keep experimental; add dedicated docs/tests before stable. |
| Select | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native behavior is acceptable. |
| Checkbox | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native behavior is acceptable. |
| Radio | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native behavior is acceptable. |
| RadioGroup | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native fieldset behavior is acceptable. |
| Switch | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; add browser checked-state tests later. |
| NumberInput | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; document native number input limitations. |
| DateInput | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native picker variance is expected. |
| DateTimeInput | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; document timezone non-goal. |
| MultiSelect | ui-components | experimental | Partial | Partial | Pass | Pass | Partial | P2 | Keep experimental; keyboard/search behavior needs hardening. |
| Autocomplete | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; add browser combobox tests before stable. |
| TransferList | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; add browser keyboard and long-list scroll tests. |
| Textarea | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native behavior is acceptable. |
| ValidationMessage | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; pair with Field in more examples. |
| Rating | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native radio model is correct. |
| Slider | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; native range behavior is correct. |
| Badge / StatusBadge | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; color must not be sole meaning. |
| Alert / InlineMessage | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; maintain tone semantics. |
| EmptyState | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| ErrorState | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| LoadingState | ui-components | stable | Pass | Pass | Pass | Partial | Pass | P3 | Keep stable; add motion preference tests when practical. |
| Skeleton | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| Toast | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; timer pause/resume needs browser-level tests. |
| Card / Panel | ui-components | stable | Pass | Pass | Pass | Partial | Pass | P3 | Keep stable; avoid nested decorative cards. |
| Stack / Inline / Section | ui-components | stable | Pass | Pass | Pass | Partial | Pass | P3 | Keep stable; layout primitives are low risk. |
| AppShell | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; manually verify long sidebar/header scroll. |
| Page | ui-components | experimental | Pass | Pass | Pass | Partial | Partial | P2 | Keep experimental; add page-level docs. |
| PageHeader | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; layout edge cases need browser review. |
| PageToolbar | ui-components | experimental | Pass | Pass | Pass | Partial | Partial | P2 | Keep experimental; toolbar wrapping needs browser review. |
| SideNav | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; long nav scroll is now covered in matrix. |
| TopNav | ui-components | experimental | Pass | Pass | Pass | Partial | Partial | P2 | Keep experimental; responsive overflow needs browser review. |
| Breadcrumbs | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; truncation behavior needs more coverage. |
| Tabs | ui-components | experimental | Pass | Pass | Pass | Pass | Pass | P2 | Keep experimental; browser arrow-key tests should be added. |
| Popover | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; shared overlay foundation is in place. |
| Menu | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; add richer keyboard tests later. |
| Dropdown | ui-components | stable | Pass | Pass | Pass | Partial | Pass | P3 | Keep stable; generic content is caller-owned. |
| Tooltip | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; avoid replacing accessible names with tooltip text. |
| Dialog | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; focus trap/restoration should get browser tests. |
| Drawer | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; long body scroll should get browser tests. |
| ConfirmDialog | ui-components | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; preserve explicit destructive action copy. |
| UniversalDataGrid | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; continue hardening sticky/scroll/browser checks. |
| DataGridToolbar | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| DataGridSearch | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| DataGridFilterBar | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| DataGridColumnMenu | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable; keyboard menu coverage should expand. |
| DataGridSkeletonRows | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| DataGridEmptyState | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| DataGridErrorState | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| DataGridPagination | ui-data-grid | stable | Pass | Pass | Pass | Pass | Pass | P3 | Keep stable. |
| DataGrid state/adapters | ui-data-grid | stable | Pass | Pass | N/A | Pass | Pass | P3 | Keep stable; adapter contract docs remain source of truth. |

## API Consistency Notes

| Convention | Current direction |
| --- | --- |
| Value state | Use `value`, `defaultValue`, and `onValueChange` for semantic component values. Native form controls may also expose native `onChange`. |
| Boolean state | Use `checked`, `defaultChecked`, and `onCheckedChange` for Switch-like state. Toggle buttons use `pressed`, `defaultPressed`, and `onPressedChange`. |
| Overlay state | Use `open`, `defaultOpen`, and `onOpenChange`. |
| Availability | `disabled` blocks interaction and submission where applicable. `readOnly` blocks mutation but may still submit native values when that matches native semantics. |
| Validation | Use `invalid`, `required`, `aria-invalid`, `aria-required`, and Field/ValidationMessage relationships. |
| Size/density | Component `size` controls local control size. App or container `data-density` controls shared density tokens. |
| CSS extension | Public classes use `dv-*`; grid classes and variables use `udg-*`. Static visual styles stay in CSS. |

## P0/P1 Remediation

No confirmed P0/P1 component defects were found during this pass. Components that do not yet meet stable gates remain `experimental` rather than being promoted.
