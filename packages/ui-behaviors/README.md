# `@vyrnforge/ui-behaviors`

Framework-neutral behavior foundations for VyrnForge UI.

This S4 foundation package establishes renderer-independent controller types,
transition reasons, subscriptions, and canonical behavior-event construction.
Component-specific controllers are introduced during S5 and must preserve the
existing React public API and browser behavior.

## Boundary

The package may depend on `@vyrnforge/ui-core` only. Source code must not import
or reference React, React DOM, Vue, Angular, `HTMLElement`, `ElementInternals`,
`CustomEvent`, `document`, `window`, or `customElements`.

```ts
import {
  createBehaviorEvent,
  type BehaviorController,
  type BehaviorEvent,
} from "@vyrnforge/ui-behaviors";
```

The package intentionally owns no CSS and performs no DOM work.
