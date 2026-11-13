# 2026-11-13 — L3 responsibility-minimal composition revision

## Decision

Re-audit Layer 3 from responsibility boundaries rather than the inherited ten-concept inventory.

The accepted runtime/public L3 inventory is now:

1. Stack
2. Inline
3. Cluster
4. AutoGrid
5. Container
6. ControlGroup

## Retired L3 concepts

- AspectRatio: ordinary CSS `aspect-ratio`.
- Field: form composition recipe; use semantic relationships plus Stack until a stronger Field contract is independently justified.
- Fieldset: native HTML `fieldset/legend`.
- RadioGroup: native radio grouping plus native fieldset/legend and Stack/Cluster layout.

## Representation

Native Web hooks are canonical. React/Vue render semantic hosts, Angular decorates authored hosts, and Elements applications consume native HTML plus Web hooks. There is no Elements-specific layout runtime or Custom Element registration surface.

## Naming

The previous Grid contract specifically implemented `repeat(auto-fit, minmax(...))`, so the public name is corrected to AutoGrid. Arbitrary track systems remain ordinary CSS Grid.

## Product ownership

The repository continues to use one aggregate `layout` product unit because current Product Graph projection maps a product-unit ID directly to one public package subpath. Splitting the six concepts into separate units while preserving one `/layout` public subpath would require new special-case projection machinery with no runtime/product benefit. This is an authoring-tooling constraint, not a semantic claim that the six responsibilities are one component.

## Compatibility

This is a deliberate rebuild breaking correction. The changeset records all removed/renamed exports, hooks, Angular directive names, Elements entrypoint removal, and the AutoGrid token rename.
