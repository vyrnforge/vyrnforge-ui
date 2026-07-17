> Archived: This document is historical and no longer canonical.
> Replacement: ../../architecture/02-state-and-adapter-ownership.md

# Redux Policy

VyrnForge UI packages are store-agnostic. They do not require Redux, `react-redux`, RTK Query, Zustand, TanStack state, or any global app store.

## Package Rule

- `@dravyn/ui-core` must not depend on Redux or app state libraries.
- `@dravyn/ui-components` must not depend on Redux or app state libraries.
- `@dravyn/ui-data-grid` must not depend on Redux or app state libraries.
- VyrnForge packages must not create a global store internally.
- Core logic must remain pure TypeScript and store-agnostic.

## App Integration

Consuming apps may use Redux, RTK Query, or another state/data layer. The grid integrates with those choices through controlled state props and callbacks.

```tsx
const gridState = useSelector(selectGridState("users"));

<UniversalDataGrid
  tableId="users"
  columns={columns}
  rows={rows}
  state={gridState}
  onStateChange={(next) =>
    dispatch(updateGridState({ tableId: "users", state: next }))
  }
/>;
```

In this model, the app owns the Redux slice and persistence/fetch behavior. `UniversalDataGrid` receives state, emits the next state, and stays independent of the store implementation.

## Future Adapter Option

A separate optional package such as `@dravyn/ui-data-grid-redux` or `@dravyn/ui-adapters-redux` may be created later if repeated integration code becomes valuable.

Do not add that package now. Keep the core packages dependency-minimal and framework-store-neutral.
