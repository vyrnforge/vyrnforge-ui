# Autocomplete

`Autocomplete` is an experimental single-select searchable combobox for known option sets. It is native-first, dependency-free, and reuses the shared Dravyn overlay foundation for portal rendering, anchored positioning, outside dismissal, and topmost Escape handling.

## Import

```tsx
import { Autocomplete } from "@dravyn/ui-components";
```

## Use The Right Control

| Control | Use when |
| --- | --- |
| `Select` | The option set is small, stable, and easy to scan. |
| `Autocomplete` | The option set is larger and typing part of a known label materially reduces selection effort. |
| `TextInput` | The application accepts unconstrained text. |
| `SearchInput` | The input filters an existing page or dataset rather than selecting a value. |

## State And Async Ownership

`value`, `inputValue`, and `open` are independently controllable. Applications own data fetching, debounce, cancellation, caching, errors, and option mapping. Pass `loading` and updated `options` into the component; Autocomplete never performs requests.

```tsx
<Autocomplete
  inputValue={query}
  loading={loading}
  onInputValueChange={setQuery}
  onValueChange={(value, option) => setOwner(value)}
  options={owners}
/>
```

## Accessibility

- The text input uses `role="combobox"` with `aria-autocomplete="list"`.
- The portalled suggestion surface uses `role="listbox"`; every option uses `role="option"`.
- Keyboard navigation keeps DOM focus on the input and updates `aria-activedescendant`.
- Arrow keys skip disabled options; Home and End move to the first or last enabled option; Enter selects; Escape closes; Tab exits normally.
- `Field` render-function composition supplies the id, description relationship, required state, invalid state, and disabled state.
- Supplying `name` renders a hidden input with the selected value for standard form submission.

## Overlay Reuse

Autocomplete uses the private Portal, DismissableLayer, overlay stack, and `useAnchoredPosition` utilities. It must not gain a second portal root, outside-click handler, focus trap, or positioning calculation.

## Current Limits

Autocomplete intentionally does not support multiple values, tags, free-solo values, option creation, grouping, virtualization, nested option trees, fuzzy matching, or internal remote fetching. Those require separate accessibility and interaction work.
