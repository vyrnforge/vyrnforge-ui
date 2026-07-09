# State And Adapter Ownership

## State levels

| Level | Examples | Owner |
| --- | --- | --- |
| Local transient UI state | menu open, popover open, hover/focus, drag session, resize session | component/hook |
| Component view state | search, filters, sort, pagination, density, columns, grouping, selected rows | component uncontrolled or app controlled |
| Persisted preference state | column setup, density, page size, saved filters/views | adapter or app storage |
| Server query state | search/filter/sort/page/group emitted for API | grid query contract; app fetch behavior |
| Business state | API rows, auth, tenant, permissions, export jobs, mutations | consuming app |

## Redux policy

Dravyn packages must not depend on:

- Redux
- React Redux
- RTK Query
- Zustand
- TanStack state/query
- any global store

Apps may use Redux through controlled props.

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

## Adapter rules

| Adapter | Does | Does not |
| --- | --- | --- |
| Persistence | stores selected preference state | store row data or business state |
| Server query | builds serializable query contracts | fetch data or own cache |
| Export request | builds export request contracts | generate XLSX/PDF/CSV by default |
| Saved views | save/restore named preference bundles | own backend persistence by default |
| Future Redux adapter | bridge controlled state | make Redux required |

## Practical implementation rules

- Keep rows out of grid state.
- Keep selected rows out of persistence by default.
- Keep reducers/selectors pure.
- Keep hooks as coordination layers.
- Keep adapters explicit and serializable.
