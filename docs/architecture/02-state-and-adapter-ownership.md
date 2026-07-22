# State And Adapter Ownership

## State levels

| Level                              | Examples                                                                            | Owner                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Renderer-local transient state     | hover, focus observation, pointer session, portal mount, DOM measurement            | React/native renderer or DOM adapter                                  |
| Framework-neutral controller state | controlled value, collection order, active item, selection, open reason, validation | planned `ui-behaviors` controller or consuming app in controlled mode |
| Component view state               | search, filters, pagination, density, grouping, selected values                     | component uncontrolled or app controlled                              |
| Persisted preference state         | density, column setup, page size, saved filters/views                               | adapter or app storage                                                |
| Server query state                 | search/filter/sort/page/group emitted for API                                       | package query contract; app fetch behavior                            |
| Business state                     | API rows, auth, tenant, permissions, export jobs, mutations                         | consuming application                                                 |

## Framework-neutral controller policy

Portable state transitions belong in planned `@vyrnforge/ui-behaviors` when
they are reused by React and native renderers.

A shared controller may own:

- controlled and uncontrolled transition rules;
- collection registration and ordering;
- active-item and selection decisions;
- validation state;
- canonical transition reasons and domain event payloads.

A shared controller must not own:

- React hooks, JSX, synthetic events, or refs;
- Angular or Vue framework objects;
- DOM nodes, focus execution, positioning, observers, or portals;
- application persistence, requests, authorization, or workflows.

Renderers translate their framework conventions into the shared controller and
translate controller results into React callbacks or canonical `vf-*` DOM
events.

## Redux and global-store policy

VyrnForge packages must not depend on:

- Redux or React Redux;
- RTK Query;
- Zustand;
- TanStack state/query;
- another required global store.

Applications may use any store through controlled props, properties, and event
adapters. Store integration must not leak into `ui-core`, `ui-behaviors`,
`ui-components`, or `ui-elements` public requirements.

## Adapter rules

| Adapter               | Does                                                                | Does not                                    |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| Renderer adapter      | maps framework props/events/lifecycle to a controller               | redefine shared behavior                    |
| DOM adapter           | executes focus, events, observers, positioning, and scroll behavior | own domain state or application workflows   |
| Angular forms adapter | maps Angular forms state to native element properties/events        | re-render or duplicate the native component |
| Vue model adapter     | maps `modelValue` and update events to the canonical value contract | own selection or validation logic           |
| Persistence           | stores selected preference state                                    | store row data or business state            |
| Server query          | builds serializable query contracts                                 | fetch data or own cache                     |
| Export request        | builds export request contracts                                     | generate files by default                   |

## Practical implementation rules

- Keep renderer-only state out of `ui-behaviors`.
- Keep business data and authorization outside VyrnForge packages.
- Keep reducers and controller transitions pure.
- Keep framework adapters thin and replaceable.
- Keep persistence and server integration explicit and serializable.
- Preserve the documented React controlled/uncontrolled public API during S5.
