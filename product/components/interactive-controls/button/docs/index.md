# Button

Use Button for an immediate action or command. Use a link when the user intent is navigation to another destination.

## When to use

- Use a button to submit, save, confirm, retry, open, close, toggle, or otherwise invoke an action.
- Use visible action text that describes the result whenever space and context allow.
- Use a link instead when activating the control navigates to another URL or route.

## Native baseline

A VyrnForge Button remains a native `<button>`. Add `data-vf-button` and the documented presentation attributes, then load the Button stylesheet from `@vyrnforge/web`.

VyrnForge does not add JavaScript to reproduce native button activation, focus, disabled behavior, or form participation.

## Variants

Choose visual emphasis by the action's role, not by its keyboard or form behavior.

- `primary`: the principal action in the current decision area.
- `secondary`: an alternative action alongside the principal one.
- `ghost`: a lower-emphasis action.

Visual emphasis does not change the semantic meaning of the native button.

## Sizes

The baseline sizes are `sm`, `md`, and `lg`. Pick a size that fits the surrounding layout and remains accessible; size changes presentation, not native activation or form behavior.

## States and async work

Use the native `disabled` attribute when the action must not be available. Loading is a separate state: add `data-vf-loading` and `aria-busy="true"` while work associated with the action is in progress.

Loading does not disable the control. If repeat activation must be prevented, set `disabled` explicitly in addition to the loading state. Application async orchestration, mutation completion, debouncing, and confirmation policy remain application responsibilities.

## Forms

Button preserves native form behavior. VyrnForge does not override the platform default `type`.

Inside a form, omitting `type` invokes the browser's default **submit** behavior. Use `type="submit"` for an intentional submit action, `type="reset"` for native reset, and `type="button"` for non-submit commands. Preserve native `name`, `value`, and `form` behavior; application code owns submission, validation and persistence.

The **Native form actions** example demonstrates all three button types with a labeled Input and explicit submitter `name`/`value`. The Native Web documentation page loads both `@vyrnforge/web/styles/button.css` and `@vyrnforge/web/styles/input.css` for that composition; consumers using the Input styling hook must load its public stylesheet too. In the **documentation preview only**, the docs application prevents navigation and shows a local submit, reset, or “Inspect value” result. These demonstration handlers are application code, not part of VyrnForge Button. Copying this HTML to a consuming application requires its own submit and non-submit action handlers.

## Interaction and focus

Pointer, Enter, and Space activation come from the browser. Focus remains native, and VyrnForge provides `:focus-visible` presentation rather than programmatically moving focus.

Do not add custom keyboard handlers to recreate native button behavior.

## Accessibility

Keep a real `<button>` and provide an accessible name through visible content or an appropriate naming mechanism such as `aria-label` or `aria-labelledby`.

Do not add an explicit button role to a native button. Use native `disabled` rather than substituting `aria-disabled`. The loading indicator is decorative; `aria-busy="true"` communicates the busy state without replacing the button's accessible name.

## Styling and adaptation

Canonical Button styling is owned by `@vyrnforge/web`. It supports theme inheritance, focus-visible presentation, forced colors, reduced motion, and logical-direction styling.

Prefer the public VyrnForge tokens and supported hooks. Private custom properties prefixed with `--_vf-` are implementation details and are not customization API.

## Framework availability

Native Web uses a native `<button data-vf-button>`. React provides the public `Button` component and a framework-scoped React documentation guide; Angular provides `VfButtonDirective` on a native button; Vue provides `Button` with native attributes and slot content. All available ports preserve the shared button semantics with idiomatic authoring. Elements Button is intentionally not shipped; do not create a custom element to reproduce native button activation.

Documentation completeness and rollout may differ across frameworks. An implementation export does not by itself establish a fully reviewed guide, independent assistive-technology acceptance, or release readiness.

## Contract and evidence boundaries

Button has no built-in asynchronous operation, busy-state controller, form submission handler, or programmatic focus manager. Consumer code owns these concerns. The component's keyboard, form, accessibility, visual, and runtime expectations are defined by the canonical Button Contract; automated browser checks and component evidence prove only their tested revision and surfaces, not universal assistive-technology or production readiness.

## Button groups and joined actions

ButtonGroup is **not** a standalone VyrnForge interactive control. Independent actions use Flow with an inline, wrapping gap. When related actions need a joined visual treatment, the existing Button stylesheet provides the optional native-element recipe `data-vf-button-group`. `data-vf-button-group-orientation="vertical"` stacks the same actions.

Every direct child Button retains its own type, Tab stop, Enter/Space activation, disabled/loading state and focus-visible outline. Add `role="group"` and an authored `aria-label` or `aria-labelledby` when the relationship is meaningful. The recipe changes adjoining boundaries, not state or focus navigation. Toolbar owns a composite command keyboard model; ToggleGroup owns coordinated pressed choices; SegmentedControl owns an exclusive radio-like value; SplitButton owns a primary action and menu.

Joined buttons do not automatically wrap. For narrow layouts choose independent Flow actions or the vertical orientation rather than clipping focus. The joined recipe uses logical corners, RTL, canonical Button tokens, theme and inherited density.

## Accessible icon actions

Use the optional **icon-only presentation** on an ordinary native Button, not a second IconButton component. In React set `iconOnly`, in Angular bind `iconOnly` on `button[vfButton]`, in Vue set `iconOnly`, and in Native Web add `data-vf-icon-only` to `button[data-vf-button]`. This gives a centered **square** target using the same `sm|md|lg` sizing and inherited density, with a minimum 2rem square target even in compact mode. The visual control radius stays restrained rather than becoming a pill or circle.

Keep just the icon as visual content and provide a stable, localized button name, for example `aria-label="Save bookmark"` or `aria-labelledby`. The Icon remains decorative; the Button owns the name, native type, focus, activation, disabled and busy state. No text is inferred from an icon definition. Prefer `variant="ghost"` for quiet toolbar actions, `secondary` for an outlined alternative, and `primary` only where icon-only emphasis is truly warranted. Omitting variant still preserves Button's regular primary default: the new mode does not secretly choose an emphasis role.

Icon-only loading centers one visual spinner instead of showing spinner and icon side-by-side; the original icon is visually hidden while busy, `aria-busy` remains true, and loading still does **not** disable activation. Size and visual emphasis are independent; use `<Icon size="sm|md|lg">` with a matching Button size where desired. Regular icon-with-text Buttons still use ordinary text padding and need no `iconOnly`.

The canonical Button Contract records the icon-only extension, integrated in PR #1503. Its machine evidence does not establish actual-size visual approval, independent assistive-technology review or release readiness.

### Consistent presentation across pressed and grouped controls

`ToggleButton` also supports `iconOnly` in React/Vue/Angular and `data-vf-icon-only` in Native Web. Its `sm|md|lg` icon geometry reuses Button CSS, while its `aria-pressed` behavior remains independent. Use a stable accessible name, even when the icon and pressed state change.

`ToggleGroupItem` and `SegmentedControlItem` accept the framework-neutral `data-vf-icon-only` presentation marker on their native host/label. It yields a square medium-control-size target, with a 2rem minimum in compact density. It does not add a selection policy or reinterpret a group as a toolbar. Every icon item needs an authored name on its actual interactive element.

Joined icon commands continue to use the `data-vf-button-group` recipe and independent native activation. Name each icon Button and the parent group when meaningful; focus is layered above adjacent hover. Use the independent Flow/vertical alternatives at narrow widths rather than wrapping joined seams.

## ToggleButton and pressed state

ToggleButton toggles **one** independent persistent pressed state on a native button with `aria-pressed`. Keep the accessible name stable across pressed states. React and Vue support controlled/uncontrolled state, Angular a pressed model, and Native Web a connector. ToggleButton shares Button's `sm|md|lg` size styling, but does not imply group selection or a loading state. Use ToggleGroup/SegmentedControl for coordinated choices.

## Density and target sizing

Inherited `comfortable|compact` density is distinct from component `sm|md|lg` size. Compact must preserve visible focus and usable target access. Review narrow and zoomed layouts, RTL, forced-colors and reduced motion. There is no `large` global density.
