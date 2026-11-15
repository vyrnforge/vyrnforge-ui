# Layer 5 — Composite widget source ownership

Layer 5 owns self-contained reusable widgets that coordinate multiple semantic or interactive parts around one coherent local interaction model. A widget may compose lower-layer components, use Layer 4 pure capabilities such as collection navigation or typeahead matching, and delegate browser-owned behavior to native platform primitives. Layer 5 does not imply a shared focus, portal, overlay, lifecycle, or selection runtime.

The canonical source directory is `product/components/composite-widgets/`. Stable component IDs, documentation routes, and public package subpaths are independent of this ownership taxonomy.

## Responsibility families

Layer 5 authoring is grouped by reusable responsibility. These folders are source-ownership categories only; they do not create runtime modules, package namespaces, public import prefixes, or shared managers.

| Family                      | Canonical source folder      | Widgets                                                                                        |
| --------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Disclosure & view switching | `disclosure-view-switching/` | `disclosure`, `accordion`, `tabs`                                                              |
| Transient surfaces          | `transient-surfaces/`        | `dialog`, `alert-dialog`, `drawer`, `popover`, `tooltip`, `preview-card`                       |
| Commands & actions          | `commands-actions/`          | `menu`, `context-menu`, `menubar`, `toolbar`, `split-button`                                   |
| Collection selection        | `collection-selection/`      | `listbox`, `select`, `combobox`, `multi-select`, `tag-group`                                   |
| Choice & value              | `choice-value/`              | `toggle-group`, `segmented-control`, `rating`, `range-slider`                                  |
| Compound fields             | `compound-fields/`           | `search-field`, `password-field`, `number-field`, `color-picker`, `otp-field`, `file-uploader` |
| Content navigation          | `content-navigation/`        | `pagination`, `carousel`                                                                       |
| Interactive layout          | `interactive-layout/`        | `split-panel`                                                                                  |
| Feedback                    | `feedback/`                  | `toast`                                                                                        |

A family exists to make source responsibility legible. It must not become an excuse to create a family-wide runtime. Reuse continues through lower-layer contracts, private implementation sharing where justified, and idiomatic framework/Elements execution.

## Native-first boundary

Native HTML remains authoritative when it already owns the responsibility. `Input` owns native `number`, `date`, `time`, `datetime-local`, `month`, `week`, and `color` modes at Layer 2. The former `temporal-field` product unit is retired because it did not add a distinct composite responsibility beyond native Input temporal modes.

`number-field`, `color-picker`, `otp-field`, and `file-uploader` remain Layer 5 only for behavior that genuinely exceeds their native L2 substrates. Their contracts must not replace browser-owned semantics merely to justify a widget.

## Layer boundary

Layer 5 ends at reusable widget behavior. Application information architecture, application shell structure, structured-data systems, routing integrations, task patterns, workflows, permissions, authentication, data orchestration, and business policy belong to Layer 6, Patterns/Workflows, or consuming applications according to responsibility.

Passing source discovery does not imply component maturity. Each widget still requires evidence appropriate to its public semantics, framework ports, accessibility, browser behavior, SSR/hydration, packaging, and documentation.
