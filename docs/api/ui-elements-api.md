# `@vyrnforge/ui-elements` API

EL-6001 through EL-6017 establish the native foundation and the complete
pre-GMF3 public renderer catalog.

## Foundation exports

- `VyrnForgeElement`
- `VyrnForgeFormAssociatedElement`
- typed event creation and dispatcher utilities
- deterministic definition and registration utilities
- `vyrnForgeElementDefinitions`
- `vyrnForgeElementRegistrations`

## Public native core tags

### Display and layout

`vf-text`, `vf-heading`, `vf-caption`, `vf-label`, `vf-code-text`, `vf-badge`,
`vf-card`, `vf-panel`, `vf-stack`, `vf-inline`, `vf-page`, `vf-section`,
`vf-empty-state`, `vf-loading-state`, and `vf-error-state`.

### Actions

`vf-button`, `vf-icon-button`, `vf-button-group`, and `vf-toolbar-button`.
Action adapters resolve disabled/loading state through shared behavior and emit
`vf-action`; toggle actions also emit `vf-pressed-change`.

### Form and value controls

`vf-text-input`, `vf-textarea`, `vf-search-input`, `vf-number-input`,
`vf-date-input`, `vf-datetime-input`, `vf-checkbox`, `vf-radio`,
`vf-radio-group`, `vf-switch`, `vf-select`, `vf-slider`, `vf-rating`,
`vf-toggle-button`, `vf-toggle-button-group`, and `vf-segmented-control`.
Form-capable elements participate through `ElementInternals` and emit canonical
value or checked events.

### Field and navigation

`vf-field`, `vf-validation-message`, `vf-tabs`, `vf-breadcrumbs`, and
`vf-side-nav`.

Array/object models such as tab items, select options, segmented options, and
side-navigation items are property-only. They are not serialized into HTML
attributes.

## Events

Public event names are lowercase dash-cased `vf-*` names. They bubble and are
composed by default. Core elements use canonical contracts including:

- `vf-action`
- `vf-value-change`
- `vf-checked-change`
- `vf-pressed-change`
- `vf-invalid`
- `vf-reset`

## Styles

```css
@import "@vyrnforge/ui-core/styles/index.css";
@import "@vyrnforge/ui-elements/styles/index.css";
```

Styles consume shared VyrnForge tokens and retain the portable `vf-*` class
namespace. The native package does not import React component runtime code.

## Advanced collections

`vf-autocomplete`, `vf-multi-select`, and `vf-transfer-list` consume the shared
collection controllers. Scalar selection submits one value; multi-value
controls submit repeated form entries under the configured `name`. Options and
selected-value arrays remain property-only.

## Overlays and feedback

`vf-dialog`, `vf-drawer`, `vf-popover`, `vf-menu`, and `vf-tooltip` preserve
shared open-state, dismissal, and navigation decisions while native adapters own
focus execution and browser event wiring. `vf-toast`, `vf-toast-viewport`, and
`vf-confirm-dialog` expose queue, dismissal, action, confirmation, and live
region behavior through typed events.

## Application composition

`vf-app-shell`, `vf-page-header`, and `vf-page-toolbar` provide Light DOM
enterprise composition surfaces. Named roles are expressed through stable
`slot` attributes and VyrnForge classes rather than framework render props.

The deterministic public catalog contains 54 tags after EL-6017.
