# ADR-003 - VyrnForge UI CSS Prefix Policy

## Status

Accepted

## Context

VyrnForge UI has three package layers with distinct styling ownership: shared
foundation, shared components, and the data grid. A consistent prefix policy
keeps selectors and variables attributable to their owners, prevents accidental
coupling, and makes consumer-facing styling contracts explicit.

Earlier `dv-*` and `--dv-*` terminology does not describe the current
VyrnForge UI naming policy and is obsolete.

## Decision

- Shared CSS variables use the `--vf-*` prefix.
- Shared component classes use the `vf-*` prefix.
- Grid-specific internal variables may use the `--udg-*` prefix.
- Grid-specific internal classes may use the `udg-*` prefix.
- `dv-*` and `--dv-*` are obsolete terminology and must not be used for new
  VyrnForge UI CSS contracts or implementation work.

## Scope

This decision governs CSS variable and class naming for the VyrnForge UI
packages. It applies to new styling work, public styling documentation, and
future migration planning.

It does not itself rename existing selectors or variables, change package CSS,
or alter React components or exports.

## Public versus internal contracts

Documented CSS variables are consumer-facing contracts. Consumers may rely on
and scope overrides of variables documented in `docs/api/css-token-reference.md`.

Class names are public only when documented as such. Undocumented internal
classes, including `vf-*` and `udg-*` implementation selectors, are not public
APIs and may change without a compatibility guarantee. Consumers should prefer
documented component props and CSS variables before depending on class names.

## Data-grid exception

`@vyrnforge/ui-data-grid` may use `--udg-*` variables and `udg-*` classes for
grid-specific layout, behavior, and visual concerns. These prefixes do not
apply to shared UI foundations or reusable shared components.

Where practical, grid variables should fall back to shared `--vf-*` tokens so
app-wide theming continues to affect grid presentation.

## Compatibility implications

Documented CSS variables are part of the public compatibility surface. Removing,
renaming, or materially changing their meaning requires an explicitly planned
compatibility decision and consumer migration guidance.

Undocumented internal classes have no public compatibility commitment. Their
prefix alone does not make them supported extension points.

## Migration rules

- Do not perform implicit or bulk prefix migrations under this ADR.
- Any rename of CSS variables or classes requires a separate, controlled
  implementation task with an explicit scope and compatibility assessment.
- A migration task must identify affected public contracts, document consumer
  guidance where required, and validate the affected package CSS and consumers.
- New work must use the prefixes established by this decision; it must not add
  new `dv-*` or `--dv-*` names.

## Consequences

### Positive

- Styling ownership is clear across the three package layers.
- Consumers can distinguish stable documented CSS-variable contracts from
  internal implementation selectors.
- Grid-specific styling can evolve without broadening the shared token namespace.
- Future prefix changes require deliberate compatibility handling.

### Negative / trade-offs

- Maintainers must keep public CSS-variable documentation accurate.
- Consumers that depend on undocumented classes accept implementation-coupling
  risk.
- Prefix migration, if needed, requires dedicated work rather than a quick
  repository-wide replacement.

## Alternatives considered

- Use one shared prefix for all variables and classes. Rejected because it
  obscures grid-specific ownership and customization boundaries.
- Treat every prefixed class as public. Rejected because internal selectors need
  to evolve without creating accidental supported APIs.
- Rename all legacy names immediately. Rejected because this ADR establishes
  policy only; migration requires separately scoped, controlled implementation.
- Continue using `dv-*` and `--dv-*` terminology. Rejected because it conflicts
  with the established VyrnForge UI package prefixes.

## Non-goals

- Renaming existing classes or variables.
- Modifying CSS, components, exports, or package behavior.
- Performing bulk replacements.
- Defining a general application CSS naming policy outside VyrnForge UI packages.

## Related docs

- `docs/architecture/03-theming-and-styling.md`
- `docs/architecture/06-css-architecture.md`
- `docs/api/css-token-reference.md`
- `docs/api/css-class-reference.md`
- `docs/api/public-vs-internal-api.md`
- `docs/governance/03-naming-and-terminology.md`
