# React Button

Use the public `Button` from `@vyrnforge/react/button` when a React application needs an immediate action. The shared Button guidance owns semantic meaning; this adaptation describes only React-specific authoring and integration.

## React setup

- Install the React integration and use `import { Button } from '@vyrnforge/react/button'` from the documented public package entrypoint.
- Load the shared VyrnForge Web tokens/foundation styles and `@vyrnforge/web/styles/button.css` through the consuming application's stylesheet setup.
- Render `<Button type="button">Save changes</Button>` for a non-submit command. The checked-in React examples demonstrate the actual usage patterns; do not copy a Native Web `data-vf-button` snippet as React JSX.

## React props and ownership

- `variant` accepts `primary`, `secondary`, or `ghost`, defaulting to `primary`.
- `size` accepts `sm`, `md`, or `lg`, defaulting to `md`.
- `loading` is an optional boolean that adds the visual loading hook and `aria-busy`; it does not automatically disable the control.
- The component forwards a native `HTMLButtonElement` ref and passes through native button props, attributes, events, and children. The consuming application owns click actions, async state, errors, repeated-activation policy, and any related feedback.

## React forms and accessibility

- The result is a native HTML `button` with platform keyboard activation, focus, and form behavior. Use `type="submit"` for deliberate submit actions and `type="button"` for non-submit commands inside a form; leaving type unset preserves the browser's submit default.
- Pass `disabled` when an action must be unavailable. A loading button can remain enabled; combine `loading` and `disabled` when repeat activation must be blocked.
- Give the button a meaningful accessible name through children or native accessible-name attributes. Do not add a redundant button role or custom Enter/Space activation handlers.

## React rendering boundary

- React owns event handlers, state, refs, effects, rendering, and hydration. VyrnForge Button itself renders a native button and does not install a separate document-level controller or assume an application router.
- Check the React port's actual SSR and hydration verification before claiming a specific deployment environment is supported. The source shown here is integration guidance, not independent SSR or assistive-technology certification.
