# Button

Use Button for an immediate action or command. Use a link when the user intent is navigation to another destination.

## When to use

Use Button for an immediate action such as Save, Cancel, Submit or Retry. Prefer a link for navigation.

Choose a short, specific, visible label. Use ToggleButton—not an action Button—when the control represents a persistent on/off choice.

## Native baseline

Every VyrnForge Button renders a real `<button>`. Browser activation, focus, disabled state and form submission remain native. Framework adapters provide idiomatic authoring, not a replacement interaction system.

Use an explicit `type` in forms: `submit` submits, `reset` resets and `button` performs a non-submit command.

## Variants

Choose emphasis according to the action's priority:

- `primary` for the main action in a decision area.
- `secondary` for a supporting alternative.
- `ghost` for a quieter command.

Variants change appearance, not keyboard, focus or form semantics. Avoid making every nearby action primary.

## Sizes

Use `sm`, `md` (default) or `lg` for the available space and hierarchy. Sizes affect the visible control, not its activation contract. Keep focus and pointer targets usable under zoom and compact density.

## States and async work

Use native `disabled` when the action is unavailable. Use loading with `aria-busy="true"` while the application's work is in progress.

**Loading does not automatically prevent repeat activation.** If that is required, explicitly disable the Button or guard the handler. Applications own async execution, error recovery, and confirmation policy.

## Accessible icon actions

Use `iconOnly` (React/Vue/Angular) or `data-vf-icon-only` (Native Web) on an ordinary Button for a square icon action. It retains `sm|md|lg` sizes, inherited density and the native button behavior; it is not a second IconButton component.

Give every icon-only action a stable, localized accessible name using `aria-label` or `aria-labelledby`. Treat the icon as decorative. Prefer `ghost` for quiet toolbar actions and reserve `primary` for a genuinely primary action.

An icon-only loading Button shows one centered busy indicator and keeps `aria-busy`; loading still does not disable activation. For an icon beside visible text, omit `iconOnly` and use normal Button padding.

## Button groups and joined actions

Use separate Buttons in a wrapping Flow when actions should remain independent. For related commands that should visually join, use the optional `data-vf-button-group` CSS recipe on their parent; `data-vf-button-group-orientation="vertical"` makes a vertical set.

Each Button keeps its own Tab stop, name, type, focus, disabled and loading state. Give the parent `role="group"` and an accessible name when the relationship matters. Joined groups do not wrap automatically: use separate or vertical actions when horizontal space runs out.

This is **presentation only**, not a ButtonGroup runtime, ToggleGroup, SegmentedControl, Toolbar or SplitButton.

## Forms

Buttons retain native form participation. Inside a form, a Button without `type` defaults to **submit**. Prefer `type="submit"`, `type="reset"`, or `type="button"` explicitly to communicate intent; retain native `name`, `value` and `form` behavior.

The demonstration uses a labeled Input and local handlers to show submit, reset and non-submit results. Those handlers are example application code; VyrnForge does not provide your validation, submission or persistence workflow.

## Density and target sizing

Inherited `comfortable|compact` density affects medium control geometry, independently of `sm|md|lg` component size and theme. Compact must not compromise focus visibility, accessible names or target usability. There is no global `large` density.

Check narrow layouts, 200% text, RTL, forced colors and reduced motion rather than treating a smaller target as automatically appropriate.

## ToggleButton and pressed state

For a persistent on/off command, use ToggleButton. It is a native button with `aria-pressed` and a stable accessible name; it also supports square icon-only presentation and Button sizes.

An independent ToggleButton is different from a coordinated ToggleGroup, an exclusive radio-like SegmentedControl and a composite Toolbar. Use the control whose selection and keyboard semantics match the task.

## Interaction and focus

Enter, Space and pointer activation are native. Focus stays with the button; VyrnForge styles `:focus-visible` rather than introducing custom keyboard navigation. Do not add key handlers that recreate browser button behavior.

## Accessibility

Provide a clear accessible name through visible text or an explicit naming relationship. Keep the native button host and native `disabled` rather than adding a redundant role or using `aria-disabled` as a substitute.

The loading indicator is decorative; `aria-busy="true"` communicates busy state without changing the Button's name. Check keyboard and focus-visible styling, contrast, forced colors and zoom. Automated checks do not replace human assistive-technology review.

## Styling and adaptation

The canonical stylesheet comes from `@vyrnforge/web`. Use supported public tokens and theme hooks; private `--_vf-` properties are not customization APIs. Styling preserves logical direction, forced colors and reduced-motion preferences.

## Framework availability

Native Web uses a native `<button data-vf-button>`. React provides the public `Button` component and a framework-scoped React documentation guide; Angular provides `VfButtonDirective` on a native button; Vue provides `Button` with native attributes and slot content. All available ports preserve the shared button semantics with idiomatic authoring. Elements Button is intentionally not shipped; do not create a custom element to reproduce native button activation.

Documentation completeness and rollout may differ across frameworks. An implementation export does not by itself establish a fully reviewed guide, independent assistive-technology acceptance, or release readiness.

## Contract and evidence boundaries

Button has no built-in asynchronous operation, busy-state controller, form submission handler, or programmatic focus manager. Consumer code owns these concerns. The component's keyboard, form, accessibility, visual, and runtime expectations are defined by the canonical Button Contract; automated browser checks and component evidence prove only their tested revision and surfaces, not universal assistive-technology or production readiness.
