# Responsibility-based component units

This is a source-ownership tree, **not** a public import hierarchy. Use `product/components/<responsibility>/<optional-family>/<id>/` and one `component.json` per logical owner. Product Graph schema v3 derives responsibility and family from the path, rejects invalid or duplicate owners, and projects stable component IDs into existing packages. Flat owners are not supported.

| Responsibility | Source directory | Role |
| --- | --- | --- |
| Elemental primitives | `elemental-primitives/` | Non-interactive Typography and Media responsibilities |
| Interactive controls | `interactive-controls/` | Independently operable native-first controls |
| Composition primitives | `composition-primitives/` | Reusable spatial, form and control composition |
| Composite widgets | `composite-widgets/` | Self-contained widgets with coherent local interaction models |
| Application structures | `application-structures/` | Reusable application-region and navigation structure |

## Boundaries

Composite widgets own their component-specific state, intent, keyboard, focus, selection, open/close, relationships and accessibility policy. They may reuse existing components, pure capabilities and browser-native behavior. Framework/Elements ports own lifecycle, refs, rendering, DOM effects and browser API execution; no universal runtime is implied.

The existing composite responsibility families are disclosure-view-switching, transient-surfaces, commands-actions, collection-selection, choice-value, compound-fields, content-navigation, interactive-layout and feedback. See [Composite widgets](composite-widgets/README.md). The retired `temporal-field` remains retired; native temporal modes belong to Input. A distinct Calendar/DatePicker requires a separate product and contract decision.

Application structures currently own only AppShell and SideNav. See [Application structures](application-structures/README.md). Optional advanced products such as structured-data systems and editors require separate admission; size or complexity is not a source classification.

Shared foundations, CollectionNavigation and TypeaheadMatching, catalogs and patterns are distinct product-unit kinds. Reusable task guidance belongs under `product/patterns/`; routing engines, authentication, authorization enforcement, application data/state and business workflows remain consumer-owned.

Do not change stable `@vyrnforge/*` package entrypoints or consumer documentation routes merely because an internal owner moves. Ownership changes require canonical-contract alignment and Product Graph, package, documentation, browser, accessibility and clean-consumer evidence. Historical records retain original paths and terminology.
