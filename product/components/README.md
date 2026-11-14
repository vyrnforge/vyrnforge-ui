# Layer-organized component units

This is an ownership tree, **not** a public import hierarchy. Stable component IDs and public package subpaths are projected independently from source taxonomy. Optional grouping below a layer is organizational only and never creates a runtime package or public namespace.

| Layer | Source directory | Role |
| --- | --- | --- |
| L1 | `elemental-primitives/` | Deliberately accepted non-interactive responsibilities; currently Typography (`text`, `code`, `kbd`) and Media (`icon`, `image`) |
| L2 | `interactive-controls/` | Single independently operable native-first controls; `button`, `toggle-button`, `link`, `input`, `textarea`, `checkbox`, `radio`, `switch`, `native-select`, `file-input`, `slider` |
| L3 | `composition-primitives/` | Spatial, form, and control composition |
| L4 | — | Pure reusable behavioral capabilities rather than component-shaped runtime machinery; currently CollectionNavigation and TypeaheadMatching |
| L5 | `composite-widgets/` | Self-contained reusable widgets with one coherent local interaction model |
| L6 | `complex-ui/` | Larger reusable UI systems and application structures that coordinate multiple lower-layer interaction models or structural responsibilities |

## Layer 5 boundary

L5 is a widget layer, not a generic runtime layer. Widgets may compose lower layers and delegate to native browser behavior. They own their observable component-specific state, intent, keyboard, focus, selection, open/close, relationship, and accessibility policy; framework/Elements ports own lifecycle, refs, rendering, DOM effects, and browser API execution.

The retained L5 inventory is organized conceptually into disclosure/view switching, transient surfaces, commands/actions, collection selection, choice/value, compound fields, content navigation, interactive layout, and feedback. See `composite-widgets/README.md`.

The former `temporal-field` product unit is retired. Native temporal modes (`date`, `time`, `datetime-local`, `month`, `week`) remain part of L2 `Input`. A future Calendar/DatePicker would require a separate higher-layer contract rather than preserving a wrapper around native Input modes.

## Layer 6 boundary

The accepted L6 inventory is currently only `app-shell` and `side-nav`. Future structured-data, hierarchy, advanced query/command, rich temporal, or aggregated-feedback systems require separate contracts and evidence before becoming owners. See `complex-ui/README.md`.

Patterns are **not** a seventh component layer. Reusable task guidance lives under `product/patterns/` and may compose any L1–L6 responsibility. Routing engines, authentication, authorization enforcement, application data/state, and business workflows remain application-owned.

Do not change stable `@vyrnforge/*` package entrypoints or documentation routes merely because an owner moves between internal taxonomy folders. A layer or ownership change needs canonical-contract alignment plus Product Graph, package, documentation, browser, accessibility, and clean-consumer evidence.
