# S3 G3 Closure

## Status

**G3 evidence complete.**

VF-3001 through VF-3012 now have a single verified evidence chain for the
semantic token foundation, package adoption, visual regression, documentation,
and CI enforcement. The authoritative merge decision remains the repository
`ci-gate`; this document does not replace a passing pull-request run.

The machine-readable closure record is
`../metadata/g3-closure.json`.

## Completed scope

| Tasks           | Outcome                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| VF-3001–VF-3008 | Canonical semantic surfaces, text, borders, interaction, status, density, typography, motion, and layers      |
| VF-3009         | `@vyrnforge/ui-components` adopted canonical shared roles                                                     |
| VF-3010         | `@vyrnforge/ui-data-grid` mapped grid roles to ui-core while retaining grid-only `--udg-*` contracts          |
| VF-3011         | Fourteen real-browser visual cases cover shared components, grid, and Dialog across required themes/densities |
| VF-3012         | Metadata, docs, verifiers, CI scope, workflow artifacts, and gate evidence aligned                            |

## Required evidence

```bash
npm run verify:design-tokens
npm run verify:token-adoption
npm run verify:visual-regression
npm run test:visual
npm run verify:g3-closure
npm run quality
```

The pull request may mark G3 passed only after the final `ci-gate` succeeds.

## Final ownership boundary

- Shared reusable visual meaning remains in `@vyrnforge/ui-core` as `--vf-*`.
- Reusable component composition remains in `@vyrnforge/ui-components` as
  `vf-*`.
- Grid-specific geometry and behavior remain in `@vyrnforge/ui-data-grid` as
  `--udg-*` and `udg-*`, with shared defaults mapped to ui-core.
- Docs, playground, fixtures, and consuming apps may own presentation-specific
  CSS under their own prefixes; they must not recreate package-level semantic
  roles.

## Accepted exceptions

The explicit UniversalDataGrid high-contrast theme remains package-owned because
ui-core does not yet publish a shared high-contrast preset. It is documented and
enforced as the only package color exception.

Historical compatibility aliases remain available during alpha. New package
code must use canonical semantic names.

Manual Windows/NVDA execution belongs to VF-2014 release evidence and remains
outside G3. It does not reduce the S3 token evidence, but beta publication
continues to enforce its separate release gate.

## Closure rule

Future token changes must preserve:

1. machine-readable design-token metadata;
2. static token and adoption verification;
3. visual matrix coverage for affected theme/density states;
4. generated screenshot evidence;
5. documentation alignment; and
6. a passing `ci-gate`.

A change that bypasses any layer reopens G3 evidence and must not be merged as a
routine styling correction.
