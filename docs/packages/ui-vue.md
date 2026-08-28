# Vue package boundary

`@vyrnforge/ui-vue` is the first-class Vue facade over the canonical `@vyrnforge/ui-elements` implementation.

The package owns Vue-facing adapters and typing. Canonical rendering, shared behavior contracts, accessibility semantics, styling, and framework-independent state remain below the facade. Direct VyrnForge implementation coupling is limited to `@vyrnforge/ui-elements` unless a separately documented framework exception is approved.

The initial workspace promotes the proven generated Vue slices for button, dialog, tabs, and text input. Catalog-wide generation, Vue setup/plugin ergonomics, model mapping, fixture migration, compatibility/accessibility evidence, and release-matrix integration remain separate dependency-tracked Vue work.

The workspace is intentionally private while the Vue lane is staged. The later release-integration task owns removing that staging guard and adding the Vue artifact to canonical package/release verification once its required compatibility and accessibility evidence is complete.

This page records the package boundary only. Consumer API and migration guidance belongs to the dedicated Vue documentation task after the package-consumption cutover is complete.
