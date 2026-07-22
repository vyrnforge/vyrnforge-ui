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

Manual screen-reader status is canonical in
`docs/metadata/assistive-technology-reviews.json`. Use
`npm run verify:assistive-technology` during development and
`npm run verify:assistive-technology:release` for beta or stable promotion. A
pending record is not a failure of the current alpha implementation, but it is
not evidence of a manual pass.

## Manual assistive-technology review

VF-2014 defines two initial environments: Windows with NVDA and Chrome, and
Windows with NVDA and Firefox. Record the exact operating-system, browser, and
NVDA versions when the session is executed. The structured file contains the
fixture IDs, component IDs, contracts, required environments, and current
result status.

For each environment:

1. Check out the exact commit under review and run `npm ci`.
2. Start the deterministic application with `npm run fixtures:serve`.
3. Use the fixture routes declared in the structured evidence file.
4. Test with keyboard and NVDA; do not substitute mouse operation for a
   keyboard contract.
5. Repeat relevant scenarios in light and dark themes and at compact and
   comfortable density.
6. Record exact announcements, focus movement, virtual-cursor behavior, and
   limitations. A passing Playwright test is not a manual screen-reader pass.

Detailed session notes belong under
`docs/quality/assistive-technology-results/` and should be immutable after
review. Each structured result requires an environment ID, `passed`, `failed`,
or `conditional` outcome, reviewer, `YYYY-MM-DD` execution date,
repository-relative note reference, and concise observations. P0/P1 findings
block the relevant promotion or release.

Development validation allows schema-valid pending records:

```bash
npm run verify:assistive-technology
```

Beta and stable promotion requires every declared environment and scenario to
be complete and every result to be `passed`:

```bash
npm run verify:assistive-technology:release
```

## AI guidance

When AI creates or modifies a component, it must include accessible labels and keyboard behavior for every interactive element.
