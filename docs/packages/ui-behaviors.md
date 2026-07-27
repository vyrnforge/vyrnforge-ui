# `@vyrnforge/ui-behaviors` — S5 Foundations Current

## Purpose

Framework-neutral behavior boundary for public non-grid components. The
package owns portable state transitions and controller events while renderer
lifecycle, DOM execution, application state, and backend workflows remain
outside it.

## Boundary

The package may depend on `@vyrnforge/ui-core` only and is compiled with an
ES-only TypeScript library. Repository verification rejects renderer imports
and DOM identifiers.

## Current scope

### MF-5001 — Controllable state

- explicit controlled-mode detection by property presence;
- uncontrolled committed state;
- controlled change proposals;
- external value synchronization;
- reset, updater, equality, snapshot, command, and event contracts.

### MF-5002 — Collection and active item

- keyed item registration and updates;
- deterministic order and stable registration sequence;
- enabled-key projection;
- first, last, next, and previous navigation;
- disabled-item skipping, optional looping, and active-item reconciliation.

### MF-5003 — Selection

- single and multiple selection;
- select, deselect, toggle, range, replace, clear, and synchronization;
- range anchors and ordered-key providers;
- disabled-key filtering;
- controlled and uncontrolled selection contracts.

### MF-5004 — Controller events

- canonical reason vocabulary;
- immutable behavior-event records;
- event and snapshot subscription channels;
- reasoned collection, active-item, value, and selection events.

### MF-5011 — Menu and SideNav navigation

- deterministic navigation items and enabled-item projection;
- roving active intent with first, last, next, and previous movement;
- disabled-item skipping and selected-item synchronization;
- explicit selection and dismissal reasons;
- React retains refs, tab stops, and DOM focus execution.

### MF-5012 — Overlay lifecycle and DOM adapters

- controlled and uncontrolled open lifecycle;
- explicit trigger, keyboard, pointer, focus, escape, outside interaction,
  selection, close-button, and programmatic reasons;
- framework-neutral layer ordering and pure anchored-position resolution;
- focus, layer, and position adapter contracts;
- React retains portals, focus trapping, global listeners, DOM measurement,
  scroll locking, and CSS application.

### MF-5013 — Component overlay controllers

- Dialog, Drawer, Popover, and Tooltip controller factories;
- controlled open proposals and explicit dismissal reasons;
- modal/disabled configuration and trigger/content relationships;
- React retains timers, refs, portals, focus, listeners, and measurement.

### MF-5014 — Toast and ConfirmDialog behavior

- deterministic Toast queue and visible-window state;
- explicit duration, pause/resume, action, and dismissal events;
- controlled confirmation state and loading/disabled action rules;
- React retains ReactNode payloads, timer execution, and rendering.

## Still deferred within S5

MF-5015 and MF-5016 remain. The final React behavior-adoption compatibility
audit and the GMF2 parity gate must remain explicit follow-up evidence.

## Validation

```bash
npm run test:coverage --workspace @vyrnforge/ui-behaviors
npm run verify:behavior-foundations
npm run verify:package-boundaries
```

## React adoption status

The adopted component families now include Button, ToggleButton,
ToggleButtonGroup, SegmentedControl, Checkbox, Switch, RadioGroup, Slider,
Rating, Tabs, Autocomplete, MultiSelect, Transfer List, Menu, SideNav, and the
Dialog, Drawer, Popover, Tooltip, ToastProvider, and ConfirmDialog adapters. React remains responsible for rendering and DOM execution;
`ui-behaviors` owns only portable state and transition decisions.

## Composite selection adoption

MF-5008 through MF-5010 are implemented:

- Autocomplete uses `createAutocompleteController()` for filter, open, input,
  selected-value, and active-option behavior;
- MultiSelect uses `createMultiSelectController()` for query, selection,
  open-state, and active-option behavior;
- Transfer List uses `createTransferListController()` for source/target
  partitioning, panel selection, filtering, and move operations.

React still owns every DOM node and focus call. GMF2 remains in progress.
