# Accessibility Standards

## Baseline

Dravyn should target WCAG AA as a baseline for reusable components.

## Requirements

All interactive components should support:

- visible focus state
- keyboard access
- meaningful labels
- disabled state clarity
- no color-only state communication
- reduced motion where animations exist

## Component-specific expectations

| Component type | Requirement |
| --- | --- |
| IconButton | `aria-label` required |
| Menu | arrow navigation, Enter/Space select, Escape close |
| Dialog/Drawer | role, aria-modal, focus return, Escape close |
| Tooltip | hover and focus support |
| Grid header | sort/filter/menu/resize controls accessible |
| Grid selection | checkbox labels, indeterminate state visible |
| Group rows | `aria-expanded`, keyboard toggle |

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

## AI guidance

When AI creates or modifies a component, it must include accessible labels and keyboard behavior for every interactive element.
