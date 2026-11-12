# Layer-organized component units

This is an ownership tree, **not** a public import hierarchy. The canonical Product Graph discovers each unit's stable ID from its `component.json` and final directory name. The optional category (for example `typography`) is a source organization aid rather than a component, runtime package or public export.

| Layer | Source directory | Role |
| --- | --- | --- |
| L1 | `elemental-primitives/` | Deliberately accepted non-interactive responsibilities; currently Typography (`text`, `code`, `kbd`) and Media (`icon`, `image`), with remaining candidates reviewed individually |
| L2 | `interactive-controls/` | Single independently operable controls; `button`, `toggle-button`, `link`, `input`, `textarea`, `checkbox`, `radio`, `switch`, `native-select`, `file-input`, `slider` |
| L3 | `composition-primitives/` | Spatial, form, and control composition; grouped projection owner `layout` |
| L4 | `behavioral-infrastructure/` | Public port primitives `portal`, `presence`; reusable non-UI algorithms remain under `product/capabilities/` |
| L5 | `composite-components/` | Multi-element UI; `dialog`, `tabs`, `disclosure`, `accordion`, `alert-dialog`, `drawer`, `popover`, `tooltip`, `preview-card`, `menu`, `context-menu`, `menubar`, `toolbar`, `split-button`, `listbox`, `select`, `combobox`, `multi-select`, `toggle-group`, `segmented-control`, `tag-group`, `rating`, `range-slider`, `carousel`, `color-picker`, `file-uploader`, `number-field`, `otp-field`, `pagination`, `password-field`, `search-field`, `split-panel`, `temporal-field`, `toast` |
| L6 | `complex-components/` | Higher-level structures and complex widgets; `app-shell`, `side-nav` |

Patterns are **not** a seventh component layer. Reusable task/feedback patterns live under `product/patterns/` and may compose any L1–L6 responsibility. A Pattern may project a narrowly justified public artifact into an existing package without becoming a component; Loading is the first provisional example.

An empty layer need not contain placeholder files. The original `product/components/<id>/` convention remains a transitional discovery fallback for tooling compatibility, but no current canonical component owner uses that flat form. Input owns native `number`, temporal, and color modes; Theme Toggle is application-owned composition over Switch/theme foundation rather than a component product unit.

Do not change `@vyrnforge/*` package entrypoints or `/components/<id>/` documentation routes when moving an owner. A layer change needs a canonical-contract decision, before/after graph evidence, package projection, docs, native browser, accessibility and clean-consumer checks.
