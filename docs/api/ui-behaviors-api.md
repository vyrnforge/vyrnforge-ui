# `@vyrnforge/ui-behaviors` API

Framework-neutral state, collection, selection, and controller-event
foundations for public non-grid components.

The package has no CSS, DOM, React, Vue, or Angular surface.

## Controller contracts

### `BehaviorController<TSnapshot, TCommand>`

Every behavior controller exposes:

- `getSnapshot()` for the current immutable snapshot;
- `subscribe(listener)` for committed snapshot changes;
- `dispatch(command)` for renderer-neutral command integration.

### Snapshot and event channels

- `createBehaviorSnapshotChannel<TSnapshot>()`
- `createBehaviorEventChannel<TEvent>()`

Subscriptions are idempotently removable. Publication uses a stable listener
snapshot, so listeners may unsubscribe while an event is being emitted.

## Canonical controller events

```ts
createBehaviorEvent(type, detail, reason);
```

Events are immutable plain objects. They are not DOM `CustomEvent` instances.

Canonical reasons:

- `user`
- `programmatic`
- `keyboard`
- `pointer`
- `selection`
- `collection-change`
- `clear`
- `reset`
- `restore`

Renderer adapters translate behavior events into the canonical public
`vf-*` DOM events or framework callbacks.

## Controllable state

```ts
const controller = createControllableState({
  defaultValue,
  value,
  equals,
  onChange,
});
```

`value` is optional. Its **presence** selects controlled mode, including an
explicit `value: undefined`.

Public methods:

- `setValue(valueOrUpdater, reason?)`
- `syncValue(value)`
- `reset(reason?)`
- `subscribeEvent(listener)`
- standard `BehaviorController` methods

In uncontrolled mode, `setValue` commits to the snapshot and emits a change
event. In controlled mode, it emits a proposal while the external source of
truth remains unchanged until `syncValue` is called.

## Collection and active item

```ts
const collection = createCollectionController({
  initialItems,
  activeKey,
  loop,
  onEvent,
});
```

Collection items define `key`, `data`, optional `disabled`, and optional numeric
`order`.

Public methods:

- `upsertItem(item, reason?)`
- `removeItem(key, reason?)`
- `clear(reason?)`
- `setActiveKey(key, reason?)`
- `moveActive("first" | "last" | "next" | "previous", options?)`
- `getItem(key)`
- `subscribeEvent(listener)`
- standard `BehaviorController` methods

Ordering is deterministic. Navigation skips disabled items and may clamp or
loop. Removing or disabling the active item reconciles to the nearest remaining
enabled item.

## Selection

```ts
const selection = createSelectionController({
  mode: "single" | "multiple",
  selectedKeys,
  defaultSelectedKeys,
  allowEmpty,
  orderedKeys,
  isDisabled,
  onSelectionChange,
});
```

Public methods:

- `select(key, reason?)`
- `deselect(key, reason?)`
- `toggle(key, reason?)`
- `selectRange(key, options?)`
- `replace(keys, reason?)`
- `clear(reason?)`
- `syncSelectedKeys(keys)`
- `setAnchorKey(key)`
- `isSelected(key)`
- `subscribeEvent(listener)`
- standard `BehaviorController` methods

Selection keys are unique. Disabled keys are rejected. Single mode retains at
most one key. Range selection uses the configured ordered key source and skips
disabled keys.

## Public export groups

The package entry point exports:

- controller and subscription types;
- canonical reasons, events, and event channels;
- controllable-state types and controller factory;
- collection types and controller factory;
- selection types and controller factory;
- `vyrnForgeUiBehaviorsVersion`.

## Action and toggle controls

- `resolveActionState()` derives loading, disabled, interactive, and busy state.
- `createToggleController()` owns controlled or uncontrolled boolean state.
- `createToggleGroupController()` provides single and multiple toggle selection.
- `resolveToggleInputState()` preserves native Checkbox and Switch semantics.

## Choice controls

`createChoiceController()` provides deterministic items, disabled-choice
rejection, selected value, active value, and first/last/next/previous movement.
It is used by SegmentedControl and RadioGroup adapters.

## Numeric controls

`createNumericValueController()` and `normalizeNumericValue()` provide finite
number normalization, range clamping, optional step alignment, controlled
proposals, and increment/decrement commands for Slider and Rating adapters.

## Tabs

`createTabsController()` owns selected and focused value intent, disabled-tab
skipping, looping, Home/End movement, and automatic or manual activation. It
does not own DOM nodes or call `focus()`.

## Autocomplete

`createAutocompleteController()` owns framework-neutral option filtering,
controlled or uncontrolled value/input/open state, active-option intent,
disabled-option skipping, label restoration, and selection/clear transitions.
The renderer keeps ownership of DOM focus, listbox positioning, portal and
pointer execution.

## MultiSelect

`createMultiSelectController()` owns query filtering, controlled or
uncontrolled selected values, open state, active-option intent, disabled-option
rejection, clear and toggle transitions. The React adapter performs roving DOM
focus using the controller's active-value intent.

## Transfer List

`createTransferListController()` owns ordered source/target partitioning,
independent panel queries, visible selection, selected/all moves, disabled-item
rejection, controlled target-value proposals, and panel selection events.
Rendering, checkboxes, hidden form inputs, and pointer focus remain renderer
responsibilities.

## Navigation

`createNavigationController()` owns renderer-neutral roving active-item intent
for Menu and SideNav structures. It provides deterministic ordering,
first/last/next/previous movement, disabled-item skipping, selected-item
synchronization, and explicit selection and dismissal reasons.

The controller never stores DOM nodes or calls `focus()`. Renderer adapters map
its `activeId` to `tabIndex`, refs, and framework-specific focus execution.

## Overlay lifecycle

`createOverlayLifecycleController()` owns controlled or uncontrolled open state
and explicit open/dismiss reasons. `createOverlayLayerRegistry()` provides a
framework-neutral topmost-layer contract, while `resolveOverlayPosition()`
performs pure anchored-position calculations.

The package exports `OverlayFocusAdapter`, `OverlayLayerRegistry`, and
`OverlayPositionAdapter` contracts. React continues to own portals, focus
trapping/restoration, DOM measurement, global listeners, scroll locking, and
CSS application.

## Component overlay controllers

`createDialogController()`, `createDrawerController()`,
`createPopoverController()`, and `createTooltipController()` layer
component-specific configuration and trigger/content relationships over the
shared overlay lifecycle. They preserve controlled proposal semantics and
explicit dismissal reasons without storing DOM nodes.

React adapters use the controller relationship IDs for `aria-controls` and
`aria-describedby`, while portals, focus traps, timers, event listeners, DOM
measurement, and CSS placement remain renderer-owned.

## Toast

`createToastController()` owns queue insertion and replacement, visible-window
selection, explicit duration values, pause/resume state, action events, and
dismissal reasons. Payloads are generic so each renderer can retain its own
renderable content type. Timer scheduling remains a renderer adapter concern.

## ConfirmDialog

`createConfirmDialogController()` owns controlled or uncontrolled open state,
loading and disabled action eligibility, cancel proposals, confirm events, and
user-dismissal blocking while loading. The React adapter keeps rendering and
button event translation.

## Related sources

Behavior ownership and renderer boundaries are canonical in
`docs/architecture/02-state-and-adapter-ownership.md`. Historical behavior
closure evidence remains available under `docs/metadata/` and does not define
the current public API.
