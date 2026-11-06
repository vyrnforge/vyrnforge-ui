# Layer-organized component units

This is an ownership tree, **not** a public import hierarchy. The canonical Product Graph discovers each unit's stable ID from its `component.json` and final directory name. The optional category (for example `typography`) is a source organization aid rather than a component, runtime package or public export.

| Layer | Source directory | Role |
| --- | --- | --- |
| L1 | `elemental-primitives/` | Non-interactive building blocks; `typography/text`, `icon`, `surface`, `separator`, `visually-hidden` |
| L2 | `interactive-controls/` | One action or value; `button`, `link`, `checkbox`, `switch`, `number-input`, `native-select`, `slider`, `file-input`, `color-input`, `temporal-input`, `input`, `textarea`, `radio`, `toggle-button` |
| L3 | `composition-primitives/` | Layout and authored control relationships |
| L4 | `behavioral-infrastructure/` | Components only when justified; reusable non-UI behavior belongs under `product/capabilities/` |
| L5 | `composite-components/` | Multi-element UI; `dialog`, `tabs`, `disclosure`, `accordion`, `alert-dialog`, `drawer`, `popover`, `tooltip`, `preview-card`, `menu`, `context-menu`, `menubar`, `toolbar`, `split-button` |
| L6 | `complex-components/` | Higher-level structures and complex widgets |

An empty layer need not contain placeholder files. The original `product/components/<id>/` convention remains a transitional discovery fallback. `theme-toggle/` is not silently assigned to an unapproved layer and remains flat pending classification.

Do not change `@vyrnforge/*` package entrypoints or `/components/<id>/` documentation routes when moving an owner. A layer change needs a canonical-contract decision, before/after graph evidence, package projection, docs, native browser, accessibility and clean-consumer checks.
