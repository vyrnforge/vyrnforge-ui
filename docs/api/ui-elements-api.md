# `@vyrnforge/ui-elements` API

EL-6001 through EL-6018 establish the complete GMF3 browser-native renderer for
the VyrnForge non-grid beta scope.

## Foundation exports

- `VyrnForgeElement`
- `VyrnForgeFormAssociatedElement`
- typed event creation and dispatcher utilities
- deterministic definition and registration utilities
- `vyrnForgeElementDefinitions`
- `vyrnForgeElementRegistrations`

## Public native catalog

The deterministic catalog contains 58 tags.

### Display, feedback, and layout

`vf-text`, `vf-heading`, `vf-caption`, `vf-label`, `vf-code-text`, `vf-icon`,
`vf-badge`, `vf-card`, `vf-panel`, `vf-stack`, `vf-inline`, `vf-page`,
`vf-section`, `vf-empty-state`, `vf-loading-state`, `vf-error-state`,
`vf-inline-message`, and `vf-skeleton`.

### Actions

`vf-button`, `vf-icon-button`, `vf-button-group`, and `vf-toolbar-button`.
Action adapters preserve native button behavior, resolve shared disabled and
loading state, and emit canonical `vf-action` or `vf-pressed-change` events.

### Form and value controls

`vf-text-input`, `vf-textarea`, `vf-search-input`, `vf-number-input`,
`vf-date-input`, `vf-datetime-input`, `vf-checkbox`, `vf-radio`,
`vf-radio-group`, `vf-switch`, `vf-select`, `vf-slider`, `vf-rating`,
`vf-toggle-button`, `vf-toggle-button-group`, and `vf-segmented-control`.

Form-capable elements participate through `ElementInternals`. Scalar controls
submit one value; multi-value controls use repeated entries under the configured
`name`.

### Field, navigation, and composition

`vf-field`, `vf-validation-message`, `vf-tabs`, `vf-breadcrumbs`,
`vf-side-nav`, `vf-app-shell`, `vf-page-header`, `vf-page-toolbar`, and
`vf-top-nav`.

Array and object models such as tab items, select options, segmented options,
and side-navigation items are property-only and are not serialized into HTML
attributes.

### Advanced collections

`vf-autocomplete`, `vf-multi-select`, and `vf-transfer-list` consume shared
collection controllers and retain native keyboard and form contracts.

### Overlays and feedback services

`vf-dialog`, `vf-drawer`, `vf-popover`, `vf-menu`, and `vf-tooltip` preserve
shared open-state, dismissal, and navigation decisions while the native adapter
owns browser focus and event wiring.

`vf-toast`, `vf-toast-viewport`, and `vf-confirm-dialog` expose queue,
dismissal, action, confirmation, and live-region behavior. The public
`VyrnForgeToastViewportElement` service methods are:

- `add(record)`
- `updateToast(id, patch)`
- `dismiss(id)`
- `dismissAll()`

## Renderer mapping contracts

Some React convenience exports intentionally do not require another Custom
Element tag:

| React API       | Native contract                                    |
| --------------- | -------------------------------------------------- |
| `Alert`         | `vf-inline-message`                                |
| `Dropdown`      | `vf-popover` plus a `.vf-dropdown` content surface |
| `ToastAction`   | `vf-toast` with `actionLabel` / `action-label`     |
| `ToastProvider` | `vf-toast-viewport`                                |
| `useToast`      | the `VyrnForgeToastViewportElement` service API    |

## Events

Public event names are lowercase dash-cased `vf-*` names. They bubble and are
composed by default. Canonical contracts include:

- `vf-action`
- `vf-value-change`
- `vf-selection-change`
- `vf-checked-change`
- `vf-pressed-change`
- `vf-open-change`
- `vf-dismiss`
- `vf-invalid`
- `vf-reset`

## Styles

```css
@import "@vyrnforge/ui-core/styles/index.css";
@import "@vyrnforge/ui-elements/styles/index.css";
```

Styles consume shared VyrnForge tokens. Native selectors are scoped to their
Custom Element hosts so `@vyrnforge/ui-elements` and
`@vyrnforge/ui-components` can coexist in a mixed renderer fixture.

Canonical GMF3 evidence is `docs/metadata/gmf3-closure.json`.

## Consumer declarations and editor metadata

Importing the package root contributes a typed DOM map for every public tag:

```ts
import type {
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
} from "@vyrnforge/ui-elements";

const tabs = document.createElement("vf-tabs");
tabs.items = [
  { id: "summary", label: "Summary", content: "Content" },
] satisfies readonly VyrnForgeTabItem[];

const sameTabs: VyrnForgeElementForTagName<"vf-tabs"> = tabs;
```

`VyrnForgeElement` also provides typed overloads for canonical `vf-*`
events, so `event.detail` is inferred from
`VyrnForgeCanonicalEventDetailMap`.

Editor and analyzer tooling can consume the package field and public export:

```text
@vyrnforge/ui-elements/custom-elements.json
```

The manifest follows Custom Elements Manifest schema `1.0.0` and is
generated from the deterministic 58-tag registry. Registration remains
explicit; declaration imports do not define elements globally at runtime.
