# Behavior-to-React Parity Evidence

## Scope

MF-5005 through MF-5015 complete the production migrations from React-owned
state decisions to `@vyrnforge/ui-behaviors`. The React package remains the
reference renderer and keeps ownership of DOM rendering, native form elements,
focus execution, refs, and React event translation.

## Migrated component families

| Behavior contract                | React adapters                   |
| -------------------------------- | -------------------------------- |
| action availability              | Button, IconButton               |
| boolean toggle state             | ToggleButton                     |
| single/multiple toggle selection | ToggleButtonGroup                |
| single-choice selection          | SegmentedControl, RadioGroup     |
| native toggle-input resolution   | Checkbox, Switch                 |
| numeric value normalization      | Slider, Rating                   |
| tabs selection and focus intent  | Tabs                             |
| autocomplete selection/filtering | Autocomplete                     |
| multiple selection/filtering     | MultiSelect                      |
| ordered source/target transfer   | TransferList                     |
| roving navigation intent         | Menu, SideNav                    |
| overlay lifecycle and adapters   | Popover, Dialog, Drawer          |
| component overlay controllers    | Dialog, Drawer, Popover, Tooltip |
| toast queue and timing state     | ToastProvider                    |
| confirmation actions             | ConfirmDialog                    |

## Parity invariants

- public React component names, props, callbacks, CSS classes, and exports do not change;
- controlled components emit proposals and wait for the owning React component to update the value;
- uncontrolled components publish committed snapshots through the behavior controller;
- disabled choices, radio options, segmented options, and tabs cannot be selected;
- Tabs decides the next enabled value in `ui-behaviors`, while React performs `focus()`;
- Checkbox and Switch remain native inputs so browser form reset and submission semantics are not replaced;
- Slider and Rating keep their existing callback shapes and range constraints;
- Button and IconButton loading still produce `disabled` and `aria-busy` output;
- Autocomplete, MultiSelect, and Transfer List preserve existing callback shapes,
  filtering, disabled-item rules, and hidden/native form rendering;
- Menu and SideNav preserve roving focus behavior while React owns DOM refs and
  `focus()` calls;
- Popover, Dialog, Drawer, and Tooltip preserve public rendering and callback
  contracts while component-specific controllers own portable open state and
  trigger/content relationships;
- ToastProvider consumes the shared queue and pause/resume state while React
  executes timers and renders ReactNode payloads;
- ConfirmDialog routes cancel, confirm, loading, disabled, and open proposals
  through the shared confirmation controller.

## Evidence

- framework-neutral unit tests live beside the new controllers in
  `packages/ui-behaviors/src`;
- React adapter evidence lives in
  `packages/ui-components/src/components/__tests__/behavior-parity.test.tsx` and
  `packages/ui-components/src/components/__tests__/overlay-feedback-parity.test.tsx`;
- the existing primitive, DOM-interaction, accessibility, browser, fixture, and
  package verification suites remain mandatory under `npm run quality`.

## Non-scope

MF-5015 records the complete public React component classification and MF-5016 closes GMF2. Native Custom Element parity remains S6 / GMF3, and data-grid behavior remains deferred from the non-grid beta path.
