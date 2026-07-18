# Deprecation And Migration Policy

VyrnForge UI should avoid surprising consumers. Public APIs may still change during pre-alpha and alpha, but removals and incompatible changes need clear release notes once public packages exist.

## Public surface covered

This policy covers:

- JavaScript and TypeScript public APIs.
- React component props.
- CSS variables.
- Public CSS classes.
- Package entry points.
- CSS subpath imports.
- Theme and density behavior.
- Data-grid behavior.
- Accessibility behavior.

Shared styling uses `--vf-*` variables and `vf-*` classes. Data-grid styling uses `--udg-*` variables and `udg-*` classes.

## Deprecation expectations

| Maturity | Notice expectation |
| --- | --- |
| Pre-alpha | Deprecation notices are useful but not required for every change. Broad public-facing changes should include migration notes. |
| Alpha | Document deprecated APIs before removal when practical. Breaking changes must be listed in changelog and migration notes. |
| Beta | Keep compatibility where practical. Deprecations should have a clear replacement and removal target. |
| Stable 0.x | Remove only in minor releases unless security or correctness requires faster action. |
| 1.x stable | Remove only in major releases except emergency security exceptions. |

## Migration notes

Migration notes should include:

- What changed.
- Why it changed.
- The replacement API or pattern.
- Before and after examples when practical.
- Whether the change affects runtime behavior, TypeScript types, CSS, accessibility, or package imports.

Codemods should be created only when the migration is broad, mechanical, and difficult to perform manually.

## Aliases and compatibility layers

Compatibility aliases may be added when they reduce migration risk without creating long-term confusion. They should include:

- A documented removal condition.
- A changelog entry.
- Tests when behavior matters.

Do not create legacy aliases unless a real compatibility requirement exists.

## Removal criteria

Before removing deprecated public surface, confirm:

- Replacement documentation exists.
- Changelog and migration notes are ready.
- Affected examples and metadata are updated.
- Consumers have had the notice period expected for the release maturity.
- Accessibility behavior is preserved or intentionally improved.

Emergency security removals may bypass normal notice periods, but must still be documented as soon as practical.

## Breaking and non-breaking examples

Breaking changes include:

- Removing a documented component prop.
- Renaming a public export.
- Removing a documented CSS import path.
- Changing a `--vf-*`, `vf-*`, `--udg-*`, or `udg-*` contract incompatibly.
- Changing keyboard behavior or accessible names in a way consumers must adapt to.
- Changing data-grid state or adapter contract shapes.

Non-breaking changes usually include:

- Adding optional props.
- Adding new CSS variables with fallbacks.
- Adding a new component export.
- Fixing incorrect accessibility behavior while preserving the documented API.
- Improving styles without changing public class or variable contracts.

Use the changelog categories `Deprecated`, `Removed`, and `Migration Notes` for public deprecations, removals, and breaking changes.
