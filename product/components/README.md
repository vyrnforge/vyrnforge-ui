# Layer-organized component units

This is an ownership tree, **not** a public import hierarchy. The canonical Product Graph discovers each unit's stable ID from its `component.json` and final directory name. The optional category (for example `typography`) is a source organization aid rather than a component, runtime package or public export.

| Layer | Source directory | Role |
| --- | --- | --- |
| L1 | `elemental-primitives/` | Non-interactive building blocks; `typography/text`, `icon`, `surface`, `separator`, `visually-hidden`, grouped native-first projection `elemental-primitives` |
| L2 | `interactive-controls/` | One action or value; `button`, `link`, `checkbox`, `switch`, `number-input`, `native-select`, `slider`, `file-input`, `color-input`, `temporal-input`, `input`, `textarea`, `radio`, `toggle-button`, `theme-toggle` |
| L3 | `composition-primitives/` | Layout and authored control relationships; grouped projection owner `layout` |
| L4 | `behavioral-infrastructure/` | Public port primitives `portal`, `presence`; reusable non-UI algorithms remain under `product/capabilities/` |
| L5 | `composite-components/` | Multi-element UI; `dialog`, `tabs`, `disclosure`, `accordion`, `alert-dialog`, `drawer`, `popover`, `tooltip`, `preview-card`, `menu`, `context-menu`, `menubar`, `toolbar`, `split-button`, `listbox`, `select`, `combobox`, `multi-select`, `toggle-group`, `segmented-control`, `tag-group`, `rating`, `range-slider`, `carousel`, `color-picker`, `file-uploader`, `number-field`, `otp-field`, `pagination`, `password-field`, `search-field`, `split-panel`, `temporal-field`, `toast` |
| L6 | `complex-components/` | Higher-level structures and complex widgets; `app-shell`, `side-nav` |

An empty layer need not contain placeholder files. The original `product/components/<id>/` convention remains a transitional discovery fallback for tooling compatibility, but no current canonical component owner uses that flat form. Theme Toggle is classified as an L2 specialized binary presentation over the native checkbox-backed switch baseline; application theme policy remains consumer-owned.

Do not change `@vyrnforge/*` package entrypoints or `/components/<id>/` documentation routes when moving an owner. A layer change needs a canonical-contract decision, before/after graph evidence, package projection, docs, native browser, accessibility and clean-consumer checks.
