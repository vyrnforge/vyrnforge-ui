# `@vyrnforge/ui-elements` API

EL-6001 through EL-6011 establish the native foundation and first public
component wave.

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
