# Layer 5 — Composite component source ownership

Disclosure and Accordion are the first legacy L5 migration wave. Their stable component IDs, public Web styling, React, Angular, Vue and Elements package entrypoints, documentation paths, and existing semantics remain unchanged.

This is an ownership-only relocation: product metadata, examples, tests, release history and existing framework source now share canonical component roots. Angular package metadata and public package shells remain package-owned, not component implementation duplicates.

The accepted Layer 5 contract and Product Unit architecture govern subsequent migrations. Passing source discovery does not imply full user-facing component maturity. Validate Product Graph discovery, package projection, public exports, SSR, packed consumers, Native Web browser/keyboard/accessibility outcomes, and existing framework behavior on the exact final revision. No redesign or public package release is introduced by this wave.

AlertDialog, Drawer, Popover, Tooltip and PreviewCard form the second legacy L5 ownership wave. Their existing surface semantics and package projections are retained; this move does not redesign modal or anchored-surface behavior.

Menu, ContextMenu, Menubar, Toolbar and SplitButton form the command-composition ownership wave. Their existing collection-navigation, command semantics and package entrypoints remain unchanged.

Listbox, Select, Combobox, MultiSelect, ToggleGroup, SegmentedControl, TagGroup, Rating and RangeSlider form the selection/value ownership wave. Their stable value/selection contracts and package projections are preserved.
