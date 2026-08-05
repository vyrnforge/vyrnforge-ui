# Clean Code Boundaries

## Placement rule

Place code according to the most stable concern it owns, not according to the
first framework that needs it.

| Concern                                               | Owner                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| Tokens, themes, density, typography, motion, layers   | `ui-core`                                                          |
| State transitions, collections, selection, validation | `ui-behaviors`                                                     |
| Browser focus, events, observers, positioning         | renderer-owned DOM adapter until a shared DOM package is justified |
| React lifecycle and rendering                         | `ui-components`                                                    |
| Custom Element lifecycle and Light DOM rendering      | `ui-elements`                                                      |
| Grid-specific behavior and rendering                  | `ui-data-grid`                                                     |
| Authentication, permissions, requests, workflows      | consuming application                                              |

## Controller boundary

A framework-neutral controller:

- accepts serializable state and callbacks;
- returns state, commands, derived values, and stable event reasons;
- does not import a renderer framework;
- does not read or mutate the DOM;
- can be tested without a browser or framework runtime.

Controllers decide **what should happen**. DOM adapters decide **how browser
focus and events are executed**. Renderers decide **how output is produced**.

## Renderer boundary

React components may use React hooks, refs, JSX, children, and render callbacks.
Custom Elements may use browser lifecycle callbacks, properties, attributes,
slots, and Light DOM. These renderer surfaces do not belong in shared behavior
contracts.

## DOM boundary

Focus scopes, dismissal listeners, anchored positioning, observers, scroll
locking, and portal/overlay roots are DOM concerns. They may be shared later,
but they must not be moved into `ui-behaviors`.

## Framework integration boundary

Angular forms and Vue `v-model` adapters may translate framework conventions to
canonical properties and events. They must not duplicate rendering, keyboard,
selection, validation, or accessibility behavior.

## Public API rule

Internal extraction must preserve the documented React package API unless a
separate public migration is approved. Shared controller APIs are not public
merely because a renderer consumes them.

## Data-grid rule

Do not move grid-specific models into the non-grid behavior package. The data
grid remains on a deferred independent track until its own framework-neutral
architecture is approved.
