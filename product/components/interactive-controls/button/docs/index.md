# Button

Use Button for an immediate action or command. Use a link when the user intent is navigation to another destination.

## When to use

- Use a button to submit, save, confirm, retry, open, close, toggle, or otherwise invoke an action.
- Use visible action text that describes the result whenever space and context allow.
- Use a link instead when activating the control navigates to another URL or route.

## Native baseline

A VyrnForge Button remains a native `<button>`. Add `data-vf-button` and the documented presentation attributes, then load the Button stylesheet from `@vyrnforge/web`.

VyrnForge does not add JavaScript to reproduce native button activation, focus, disabled behavior, or form participation.

## Variants and sizes

The baseline variants are `primary`, `secondary`, and `ghost`. The baseline sizes are `sm`, `md`, and `lg`.

Use `primary` for the principal action in a local decision area. Use `secondary` for an alternative action and `ghost` when lower visual emphasis is appropriate. Visual emphasis does not change the semantic meaning of the native button.

## States and async work

Use the native `disabled` attribute when the action must not be available. Loading is a separate state: add `data-vf-loading` and `aria-busy="true"` while work associated with the action is in progress.

Loading does not disable the control. If repeat activation must be prevented, set `disabled` explicitly in addition to the loading state. Application async orchestration, mutation completion, debouncing, and confirmation policy remain application responsibilities.

## Interaction and focus

Pointer, Enter, and Space activation come from the browser. Focus remains native, and VyrnForge provides `:focus-visible` presentation rather than programmatically moving focus.

Do not add custom keyboard handlers to recreate native button behavior.

## Accessibility

Keep a real `<button>` and provide an accessible name through visible content or an appropriate naming mechanism such as `aria-label` or `aria-labelledby`.

Do not add an explicit button role to a native button. Use native `disabled` rather than substituting `aria-disabled`. The loading indicator is decorative; `aria-busy="true"` communicates the busy state without replacing the button's accessible name.

## Forms

Button preserves native form behavior. VyrnForge does not override the platform default `type`.

Inside a form, omitting `type` invokes the browser's default **submit** behavior. Use `type="submit"` for an intentional submit action, `type="reset"` for native reset, and `type="button"` for non-submit commands. Preserve native `name`, `value`, and `form` behavior; application code owns submission, validation and persistence.

The **Native form actions** example demonstrates all three button types with a labeled Input and explicit submitter `name`/`value`. The Native Web documentation page loads both `@vyrnforge/web/styles/button.css` and `@vyrnforge/web/styles/input.css` for that composition; consumers using the Input styling hook must load its public stylesheet too. In the **documentation preview only**, the docs application prevents navigation and shows a local submit, reset, or “Inspect value” result. These demonstration handlers are application code, not part of VyrnForge Button. Copying this HTML to a consuming application requires its own submit and non-submit action handlers.

## Styling and adaptation

Canonical Button styling is owned by `@vyrnforge/web`. It supports theme inheritance, focus-visible presentation, forced colors, reduced motion, and logical-direction styling.

Prefer the public VyrnForge tokens and supported hooks. Private custom properties prefixed with `--_vf-` are implementation details and are not customization API.

## Framework availability

The current documentation rollout is **Native Web first**. This shared guidance describes the component concept once; Native Web usage examples and public CSS are the current documentation focus. Framework-specific usage and source belong in their own future framework-scoped documentation views.

Native Web uses a native `<button data-vf-button>`. React provides `Button` with native button props/ref; Angular provides `VfButtonDirective` on a native button; Vue provides `Button` with native attributes and slot content. Each port preserves the same Button semantics with idiomatic framework syntax. The Elements Button surface is intentionally not shipped; do not use a custom element to imitate a native button.

## Contract and evidence boundaries

Button has no built-in asynchronous operation, busy-state controller, form submission handler, or programmatic focus manager. Consumer code owns these concerns. The component's keyboard, form, accessibility, visual, and runtime expectations are defined by the canonical Button Contract; automated browser checks and component evidence prove only their tested revision and surfaces, not universal assistive-technology or production readiness.
