# ADR-004: Multi-Framework Web Support

- Status: Accepted
- Decision gate: GMF1
- Scope: MF-4001, MF-4002, MF-4006, MF-4008
- Supersedes: React-only assumptions in roadmap sequencing; it does not deprecate the React package

## Context

VyrnForge UI is a reusable enterprise UI foundation, not only a React data-grid
package. The existing token, styling, accessibility, component, documentation,
and quality foundations can support more than one web framework, but current
component rendering and behavior are concentrated in React.

Continuing directly into React-only grid decomposition would deepen a framework
boundary that later renderers could not reuse. The first beta should therefore
prioritize the non-grid component system and establish a framework-neutral
contract before more grid investment.

## Decision

VyrnForge adopts a multi-framework **web** architecture with these support
levels:

1. React remains the reference renderer through `@vyrnforge/ui-components`.
2. Native HTML becomes a first-class renderer through planned browser-native
   Custom Elements in `@vyrnforge/ui-elements`.
3. Angular and Vue are verified consumers of the native element surface.
4. `@vyrnforge/ui-behaviors` will own framework-neutral controllers and state
   transitions shared by React and native renderers.
5. `@vyrnforge/ui-data-grid` remains an independently versioned React alpha
   package and is excluded from the non-grid beta critical path.
6. Mobile-native rendering, including React Native, Flutter, Android, and iOS,
   is outside this program. Tokens and portable controller logic may be reused,
   but native renderers require a separate roadmap.

## Package identity

The existing React package name remains stable through beta:

```text
@vyrnforge/ui-components
```

Do not rename it to `@vyrnforge/ui-react` during the extraction program. A
package rename would create migration churn without improving the internal
boundary.

The planned beta release group is:

```text
@vyrnforge/ui-core
@vyrnforge/ui-behaviors
@vyrnforge/ui-components
@vyrnforge/ui-elements
```

The data-grid package stays on its own alpha line:

```text
@vyrnforge/ui-data-grid
```

## Renderer strategy

VyrnForge shares contracts and behavior, not one framework's rendering model.

- React uses React components, props, hooks, children, and render callbacks.
- Native HTML uses Custom Elements, properties, attributes, DOM events, methods,
  and slots.
- Angular and Vue map their idiomatic syntax to the native element contract.
- Framework-specific wrappers are allowed only where they add real integration,
  such as Angular forms or Vue `v-model`; they must not duplicate rendering or
  accessibility logic.

## Styling decision

Light DOM is the default. Shared `--vf-*` variables and `vf-*` classes remain
visible and overridable by consuming enterprise applications. Shadow DOM is a
component-level exception requiring explicit approval and a documented parts,
slots, focus, overlay, and testing strategy.

## Support claims

Architecture fixtures do not create a framework support claim. A framework is
not marked beta-supported until its clean consumer build, browser behavior,
accessibility, typing, packaging, and documentation evidence passes GMF4.

## Consequences

### Positive

- Existing S0-S3 token, CSS, accessibility, and quality work remains reusable.
- React applications keep the current public package and API direction.
- Native HTML provides a standards-based integration surface for multiple web
  frameworks and legacy applications.
- State and accessibility rules can be maintained once and adapted per
  renderer.
- Grid work no longer blocks the broader component beta.

### Costs

- Component behavior must be extracted from React before native parity work.
- Composition, events, forms, overlays, and typing need explicit cross-framework
  contracts.
- Consumer fixtures and documentation add release-gate work.
- Native form association and framework form adapters require browser evidence.

## Non-decisions

This ADR does not:

- claim Angular or Vue beta support today;
- create the planned `ui-behaviors` or `ui-elements` runtime packages;
- port any component;
- change existing React public APIs;
- change data-grid behavior;
- select a large Web Component framework or runtime dependency.
