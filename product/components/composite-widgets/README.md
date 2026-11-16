# Composite widget source ownership

Composite widgets own self-contained reusable widgets that coordinate multiple semantic or interactive parts around one coherent local interaction model. A widget may compose existing components, use pure reusable capabilities such as collection navigation or typeahead matching, and delegate browser-owned behavior to native platform primitives. Composite widget ownership does not imply a shared focus, portal, overlay, lifecycle, or selection runtime.

The canonical source directory is `product/components/composite-widgets/`. Stable component IDs, documentation routes, and public package subpaths are independent of this ownership taxonomy.

## Responsibility families

Composite widget authoring is grouped by reusable responsibility. These folders are source-ownership categories only; they do not create runtime modules, package namespaces, public import prefixes, or shared managers.

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

A family exists to make source responsibility legible. It must not become an excuse to create a family-wide runtime. Reuse continues through existing component contracts, private implementation sharing where justified, and idiomatic framework/Elements execution.

## Native-first boundary

Native HTML remains authoritative when it already owns the responsibility. `Input` owns native `number`, `date`, `time`, `datetime-local`, `month`, `week`, and `color` modes as an interactive control. The former `temporal-field` product unit is retired because it did not add a distinct composite responsibility beyond native Input temporal modes.

`number-field`, `color-picker`, `otp-field`, and `file-uploader` remain composite widgets only for behavior that genuinely exceeds their native control substrates. Their contracts must not replace browser-owned semantics merely to justify a widget.

## Responsibility boundary

Composite widget ownership ends at reusable widget behavior. Reusable application-region structure belongs to application structures; task patterns and workflows belong to Patterns/Workflows. Specialized structured-data products require separate admission. Application information architecture, routing integrations, permissions, authentication, data orchestration and business policy remain consumer-owned.

Passing source discovery does not imply component maturity. Each widget still requires evidence appropriate to its public semantics, framework ports, accessibility, browser behavior, SSR/hydration, packaging, and documentation.
