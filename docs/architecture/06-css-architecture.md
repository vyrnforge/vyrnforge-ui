# CSS Architecture

VyrnForge CSS is package-owned and imported through stable package entry
files. Internal CSS may be split by concern, but consuming applications use
package-level imports.

## Stable imports

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

## Ownership

| Area                        | Prefix                            | Owns                                                                                                                    | Must not own                                          |
| --------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `@vyrnforge/ui-core`        | `--vf-*`, shared `vf-*` utilities | reset, primitive tokens, semantic tokens, themes, density, typography, motion, layers, utilities, accessibility helpers | component classes, grid classes, app-specific classes |
| `@vyrnforge/ui-components`  | `vf-*`                            | reusable component styles                                                                                               | `udg-*`, app styling, shared token redefinitions      |
| `@vyrnforge/ui-data-grid`   | `udg-*`, `--udg-*`                | grid shell, row/header behavior, grid-specific state and layout                                                         | generic component styles, duplicated shared semantics |
| `apps/docs`                 | `vf-docs-*`                       | docs presentation                                                                                                       | package defaults                                      |
| `examples/basic-playground` | `vf-playground-*`                 | demo presentation                                                                                                       | package defaults                                      |
| `apps/regression-fixtures`  | `vf-fixture-*`                    | deterministic test layout                                                                                               | package defaults                                      |

## Semantic decision rule

A reusable visual role belongs in `ui-core`. A component-local variable is
allowed for measured geometry or private composition. A grid-local variable is
allowed for behavior that has no meaning outside a data-management grid.

The canonical contract is
`08-semantic-token-contract.md`; the structured inventory is
`../metadata/design-tokens.json`.

## Split policy

| Size          | Action                                 |
| ------------- | -------------------------------------- |
| Over 600 LOC  | Review ownership and possible split.   |
| Over 1000 LOC | Split by package or component concern. |
| Over 3000 LOC | Must be split before further growth.   |

Do not split small files only to mirror an abstract folder tree.

## Foundation files

`ui-core` keeps the stable package import while using these internal concerns:

- `reset.css`
- `tokens.css`
- `themes.css`
- `density.css`
- `utilities.css`
- `accessibility.css`

`tokens.css` owns primitive scales, canonical semantic roles, compatibility
bridges, motion, and layers. Theme and density files override role values
without redefining ownership.

## Rules

- Keep static visual styling in CSS, not TSX.
- Use canonical `--vf-*` roles for shared semantics.
- Use `--udg-*` only for grid-specific behavior.
- Preserve package-level import paths.
- Do not expose internal CSS modules as required public API.
- Do not duplicate generic component styling in docs, playground, or grid CSS.
- Map grid color, focus, density, typography, motion, and layer decisions to
  `--vf-*` roles.
- Persistent shell scrolling belongs to the owning component CSS.
