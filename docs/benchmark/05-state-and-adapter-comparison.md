# State And Adapter Comparison

Dravyn's state model is store-agnostic. Components may manage local uncontrolled view state, but apps can control state through props and callbacks. Persistence, server queries, and export requests should use adapter contracts.

## State Models

| Library/category | State model | App integration | Dravyn lesson | Dravyn difference |
| --- | --- | --- | --- | --- |
| Dravyn UI | Controlled/uncontrolled component state, pure reducers/selectors, adapter contracts | Apps own rows, auth, permissions, workflows, API calls, exports | This is the target model | No global store dependency |
| MUI | Component-local and controlled props; MUI X has grid APIs | Apps own data fetching/state | Mature controlled prop APIs | Avoid coupling to MUI-specific grid API patterns |
| Ant Design | Controlled props and callbacks, form/table state patterns | Apps own services; Pro ecosystem can add app patterns | Enterprise admin workflows and forms | Avoid large app-framework coupling |
| Chakra UI | Controlled/uncontrolled props for primitives | Apps own data/state | Simple state APIs | Avoid style-prop/state API sprawl |
| Mantine | Hooks plus controlled/uncontrolled components | Apps own state; hooks help local behavior | Useful hook library organization | Keep shared hooks purposeful, not broad utility dumping |
| Bootstrap | Mostly DOM/CSS/JS plugin state | App/framework owns integration | Low-level simplicity | Dravyn should stay React typed and controlled-friendly |
| Tailwind Plus | Copied examples; state is app-owned | App owns everything | Blocks show practical state wiring | Do not copy-paste as primary distribution |
| Radix UI | Controlled/uncontrolled primitives | Apps compose behavior | Excellent primitive state APIs | Do not add Radix dependency by default |
| React Aria | Hooks/components with state helpers | Apps compose accessible behavior | Deep interaction state handling | Avoid exposing too much low-level state too early |
| Headless UI | Controlled/uncontrolled headless components | Apps own visuals/data | Good overlay/menu state patterns | Dravyn ships visual defaults |
| shadcn/ui | App-owned copied component state | Apps edit code directly | Transparent implementation | Dravyn stays package-managed |
| TanStack Table | Headless controlled table state | Apps own every table state slice if desired | Strong controlled state architecture | Dravyn provides ready UI around state |
| AG Grid | Grid-managed state with APIs/events | Apps use grid APIs, events, server models | Rich enterprise grid state taxonomy | Dravyn should keep smaller explicit contracts |
| MUI X Data Grid | Grid state APIs, controlled models, callbacks | Apps integrate through props/API refs | Clear grid model APIs | Dravyn should not require MUI API refs |

## Dravyn Ownership Model

| State level | Examples | Owner |
| --- | --- | --- |
| Local transient UI state | menus, popovers, hover/focus, drag, resize session | Component/hook |
| Component view state | search, filters, sorting, pagination, density, column setup, grouping, selected rows | Component uncontrolled or app controlled |
| Persisted preference state | column visibility/order/sizing, density, page size, saved filters/views later | Adapter/app storage decision |
| Server query state | search/filter/sort/page/group emitted for API | Grid query contract, app fetch behavior |
| Business/application state | API rows, auth, tenant, permissions, export jobs, mutations | Consuming app |

## Adapter Boundaries

| Adapter | Does | Does not |
| --- | --- | --- |
| Persistence | Stores user preferences selected by key | Store row data or selected rows by default |
| Server query | Builds query contracts from grid state | Fetch data or own cache |
| Export request | Builds export request contracts | Generate Excel/PDF/CSV files by default |
| Future saved views | Save/restore named preference bundles | Own backend persistence by default |
| Future Redux adapter | Bridge controlled state to Redux if useful | Make Redux required by Dravyn packages |

## Redux Policy

Dravyn packages must not depend on Redux, `react-redux`, RTK Query, Zustand, TanStack state, or any other global store.

Apps may use Redux through controlled state:

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

The Redux slice, fetching, persistence, and export workflow remain in the app.

## Recommendations

1. Keep pure state reducers/selectors independent from React.
2. Keep hooks as coordination layers, not business logic containers.
3. Keep rows out of grid state.
4. Keep selected rows out of persistence by default.
5. Add adapters before adding UI features that depend on external systems.
6. Prefer explicit contracts over hidden side effects.
