# `@vyrnforge/ui-behaviors`

Framework-neutral behavior primitives for VyrnForge UI.

The package owns portable state transitions and interaction decisions. It does
not render, read or write the DOM, manage application business state, or depend
on React, Angular, Vue, or another renderer.

## Current S5 foundations

- controllable state for controlled and uncontrolled renderer adapters;
- collection registration, deterministic ordering, active-item navigation, and
  disabled-item skipping;
- single and multiple selection with select, deselect, toggle, range, replace,
  clear, and controlled synchronization operations;
- immutable reasoned behavior events and framework-neutral event channels.

```ts
import {
  createCollectionController,
  createControllableState,
  createSelectionController,
} from "@vyrnforge/ui-behaviors";

const openState = createControllableState({
  defaultValue: false,
  onChange(event) {
    console.log(event.detail.value, event.reason);
  },
});

const options = createCollectionController({
  initialItems: [
    { key: "draft", data: { label: "Draft" } },
    { key: "disabled", data: { label: "Disabled" }, disabled: true },
    { key: "approved", data: { label: "Approved" } },
  ],
});

options.moveActive("next");

const selection = createSelectionController({
  defaultSelectedKeys: ["draft"],
  orderedKeys: () => options.getSnapshot().items.map((item) => item.key),
});

selection.selectRange("approved");
```

## Controlled-state rule

A controller is controlled when the `value` or `selectedKeys` property exists
in its options, including when the value is explicitly `undefined`.

A controlled change method emits a proposal but does not replace the current
snapshot. The renderer or consuming application commits the external value
through `syncValue()` or `syncSelectedKeys()`.

## Boundary

The package may depend on `@vyrnforge/ui-core` only. Source code must not import
or reference React, React DOM, Vue, Angular, `HTMLElement`, `ElementInternals`,
`CustomEvent`, `document`, `window`, or `customElements`.

The package intentionally owns no CSS and performs no DOM work.

## First React adapter batch

MF-5005 through MF-5007 add framework-neutral behavior for action state,
boolean toggles, toggle groups, single-choice controls, numeric controls, and
Tabs navigation. `@vyrnforge/ui-components` consumes these contracts while
keeping DOM focus, native form elements, refs, and React event translation in
the renderer package.
