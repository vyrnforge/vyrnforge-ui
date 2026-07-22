# Accessibility Standards

## Baseline

VyrnForge should target WCAG AA as a baseline for reusable components.

## Requirements

All interactive components should support:

- visible focus state
- keyboard access
- meaningful labels
- disabled state clarity
- no color-only state communication
- reduced motion where animations exist

## Component-specific expectations

| Component type | Requirement                                                                              |
| -------------- | ---------------------------------------------------------------------------------------- |
| IconButton     | `aria-label` required                                                                    |
| Menu           | arrow navigation, Enter/Space select, Escape close                                       |
| Dialog/Drawer  | role, aria-modal, focus return, Escape close                                             |
| Tooltip        | hover and focus support                                                                  |
| Grid header    | sort/filter/menu/resize controls accessible; pointer actions have keyboard fallbacks     |
| Grid body      | roving cell focus with Arrow/Home/End navigation and visible focus                       |
| Grid selection | checkbox labels, indeterminate state visible, Space selection on focused selectable rows |
| Group rows     | `aria-expanded`, keyboard toggle                                                         |

## Accessibility QA checklist

Before release, test:

- keyboard-only navigation
- screen reader labels
- focus order
- Escape behavior
- disabled state readability
- high contrast/dark contrast
- reduced motion
- table/grid semantics

## Automated DOM scanning

`@vyrnforge/ui-components` DOM tests use the internal `test/dom` accessibility
helper, backed by development-only `axe-core`. Pass a Testing Library rendered
`container` for component-local checks, or `document.body` when a portal or
other document-level content must be included. The helper fails the test with
the axe rule id, severity, remediation URL, affected selector, and failure
summary. It runs axe defaults; rule configuration is exceptional and must be
justified in the individual test. Do not use broad global suppression.

Automated scanning detects many programmatically determinable semantic and ARIA
problems, but it does not establish full WCAG conformance. Continue browser and
manual validation of keyboard paths, focus visibility and restoration,
screen-reader announcements, contrast, zoom/reflow, reduced motion, responsive
overflow, and assistive-technology behavior. Overlays and composite controls
require the browser evidence described in the component maturity model.

## AI guidance

When AI creates or modifies a component, it must include accessible labels and keyboard behavior for every interactive element.
