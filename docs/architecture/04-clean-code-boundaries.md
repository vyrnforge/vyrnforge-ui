# Clean Code Boundaries

## Data grid internal structure

Recommended structure:

```txt
packages/ui-data-grid/src/
  components/
  state/
  core/
  adapters/
  hooks/
  styles/
  types/
```

## Responsibility split

| Area | Responsibility |
| --- | --- |
| components | render UI and wire events |
| hooks | coordinate interaction behavior |
| state | reducer, defaults, selectors, merge/reset logic |
| core | pure data transforms and algorithms |
| adapters | persistence/server/export integration contracts |
| styles | visual design and theme behavior |
| types | public and internal TypeScript contracts |

## Core rules

Core functions must be:

- pure
- unit-testable
- independent from React
- independent from DOM
- independent from localStorage
- independent from CSS

## Hook rules

Hooks may use React but should not contain large business logic.

Hooks should delegate to:

- `core` for algorithms
- `state` for reducer/selectors
- `adapters` for integration contracts

## Component rules

Components should not own business state or backend behavior.

Components should:

- render native elements
- use shared components when possible
- expose controlled/uncontrolled APIs
- use accessible labels
- apply state classes
- avoid static inline styling
