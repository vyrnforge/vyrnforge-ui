# @vyrnforge/ui-angular

Angular facade workspace for VyrnForge canonical custom elements.

This workspace promotes the Angular directive slices proven during the S11 consumer/generator work into the supported package boundary. The directives adapt canonical `@vyrnforge/ui-elements` elements; they do not reimplement component behavior or styling.

## Current surface

- `VfButton`
- `VfTextInput`
- `VfTabs`
- `VfDialog`

The package is intentionally private while the Angular distribution lane is being completed. Angular peer-range policy, one-step application setup, full-catalog generation, Forms integration, SSR/hydration validation, and publication/release verification are tracked as later S12 work and are not claimed by this package yet.

## Development

From the repository root:

```bash
npm run build --workspace @vyrnforge/ui-angular
npm run typecheck --workspace @vyrnforge/ui-angular
npm run test --workspace @vyrnforge/ui-angular
npm run lint --workspace @vyrnforge/ui-angular
```

The build uses the Angular compiler with partial compilation enabled so emitted Angular declarations remain linkable by consuming Angular applications. Framework-independent behavior continues to live in VyrnForge shared foundations and canonical elements.
