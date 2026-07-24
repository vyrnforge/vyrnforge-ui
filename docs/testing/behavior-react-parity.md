# Behavior-to-React Parity Evidence

## Scope

MF-5005 through MF-5010 are the first production migrations from React-owned
state decisions to `@vyrnforge/ui-behaviors`. The React package remains the
reference renderer and keeps ownership of DOM rendering, native form elements,
focus execution, refs, and React event translation.

## Migrated component families

| Behavior contract                | React adapters               |
| -------------------------------- | ---------------------------- |
| action availability              | Button                       |
| boolean toggle state             | ToggleButton                 |
| single/multiple toggle selection | ToggleButtonGroup            |
| single-choice selection          | SegmentedControl, RadioGroup |
| native toggle-input resolution   | Checkbox, Switch             |
| numeric value normalization      | Slider, Rating               |
| tabs selection and focus intent  | Tabs                         |
| autocomplete selection/filtering | Autocomplete                 |
| multiple selection/filtering     | MultiSelect                  |
| ordered source/target transfer   | TransferList                 |

## Parity invariants

- public React component names, props, callbacks, CSS classes, and exports do not change;
- controlled components emit proposals and wait for the owning React component to update the value;
- uncontrolled components publish committed snapshots through the behavior controller;
- disabled choices, radio options, segmented options, and tabs cannot be selected;
- Tabs decides the next enabled value in `ui-behaviors`, while React performs `focus()`;
- Checkbox and Switch remain native inputs so browser form reset and submission semantics are not replaced;
- Slider and Rating keep their existing callback shapes and range constraints;
- Button loading still produces `disabled` and `aria-busy` output;
- Autocomplete, MultiSelect, and Transfer List preserve existing callback shapes,
  filtering, disabled-item rules, and hidden/native form rendering.

## Evidence

- framework-neutral unit tests live beside the new controllers in
  `packages/ui-behaviors/src`;
- React adapter evidence lives in
  `packages/ui-components/src/components/__tests__/behavior-parity.test.tsx`;
- the existing primitive, DOM-interaction, accessibility, browser, fixture, and
  package verification suites remain mandatory under `npm run quality`.

## Non-scope

This batch does not migrate Menu, SideNav, overlays, Toast, ConfirmDialog, or
the data grid. GMF2 remains in progress.
