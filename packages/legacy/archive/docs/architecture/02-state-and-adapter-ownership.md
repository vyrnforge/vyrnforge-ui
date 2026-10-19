# State And Adapter Ownership

## State levels

| Level                              | Examples                                                                            | Owner                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| Renderer-local transient state     | hover, focus observation, pointer session, portal mount, DOM measurement            | React/native renderer or DOM adapter               |
| Framework-neutral controller state | controlled value, collection order, active item, selection, open reason, validation | `ui-behaviors` or consuming app in controlled mode |
| Component view state               | search, filters, pagination, density, grouping, selected values                     | component when uncontrolled or app when controlled |
| Persisted preference state         | density, column setup, page size, saved filters/views                               | explicit adapter or consuming app                  |
| Server-query state                 | serializable search/filter/sort/page/group requests                                 | package contract; app owns fetching                |
| Business state                     | rows, auth, tenant, permissions, mutations, export jobs                             | consuming application                              |

## Framework-neutral controller policy

Portable transitions belong in `@vyrnforge/ui-behaviors` when they are reused
by React and native renderers.

A shared controller may own:

- controlled and uncontrolled transition rules;
- collection registration and ordering;
- active-item and selection decisions;
- validation-related controller state;
- canonical reasons and event payloads.

A shared controller must not own:

- framework hooks, templates, synthetic events, or refs;
- DOM nodes, focus execution, positioning, observers, or portals;
- application persistence, requests, authorization, or workflows.

## Store policy

VyrnForge packages must not require Redux, Zustand, Pinia, NgRx, TanStack
state/query, or another global application store.

Applications may integrate any store through controlled props/properties and
events. Store integration must not leak into shared package requirements.

## Adapter rules

| Adapter                | Owns                                                             | Does not own                           |
| ---------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| Renderer adapter       | framework props/events/lifecycle translation                     | shared behavior rules                  |
| DOM adapter            | focus, browser events, observers, positioning, scroll behavior   | domain state or business workflows     |
| Angular Forms adapter  | Angular form-state translation to native properties/events       | rendering or duplicate component state |
| Vue model adapter      | `modelValue`/update translation to canonical native value events | selection or validation logic          |
| Persistence adapter    | selected preference persistence                                  | row/business data                      |
| Server-query adapter   | serializable query construction                                  | fetching or cache ownership            |
| Export-request adapter | export request construction                                      | report-file generation by default      |

## Practical rules

- Keep renderer-only state out of `ui-behaviors`.
- Keep business data and authorization outside VyrnForge.
- Keep controller transitions deterministic and testable.
- Keep framework adapters thin and replaceable.
- Keep persistence and server integration explicit and serializable.
- Preserve public controlled/uncontrolled semantics across renderers where the
  shared component contract requires them.
