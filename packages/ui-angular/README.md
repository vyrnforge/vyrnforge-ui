# @vyrnforge/ui-angular

Angular facade workspace for VyrnForge canonical custom elements.

This workspace promotes the Angular directive slices proven during the S11 consumer/generator work into the supported package boundary. The directives adapt canonical `@vyrnforge/ui-elements` elements; they do not reimplement component behavior or styling.

## Current surface

- `VfButton`
- `VfTextInput`
- `VfTabs`
- `VfDialog`
- `provideVyrnForge()` application setup

The package is intentionally private while the Angular distribution lane is being completed. Full-catalog generation, Forms integration, SSR/hydration validation, and publication/release verification are tracked as later S12 work and are not claimed by this package yet.

## Application setup

Register the canonical VyrnForge elements once at the Angular application boundary:

```ts
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";

import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideVyrnForge()],
});
```

`provideVyrnForge()` uses an Angular environment initializer and delegates element registration to the canonical `@vyrnforge/ui-elements` registry. Applications do not need to copy registration code or import the native registration subpath themselves. An optional `elementRegistry` can be supplied for controlled hosts or tests.

## Dependency contract

The currently validated consumer line is Angular 22. The package declares:

- `@angular/core >=22 <23` as a required peer;
- `@angular/forms >=22 <23` as an optional peer, so applications that do not use the Forms adapter do not need to install Forms for this facade;
- `rxjs ^6.5.3 || ^7.4.0` as the Angular-compatible peer range;
- `tslib ^2.8.1` as a direct package dependency for emitted library helpers.

Angular runtime packages and RxJS remain outside VyrnForge shared foundations. Exact Angular/RxJS versions in `devDependencies` are repository validation pins and do not narrow the supported consumer peer ranges.

## Development

From the repository root:

```bash
npm run build --workspace @vyrnforge/ui-angular
npm run typecheck --workspace @vyrnforge/ui-angular
npm run test --workspace @vyrnforge/ui-angular
npm run lint --workspace @vyrnforge/ui-angular
```

The build uses the Angular compiler with partial compilation enabled so emitted Angular declarations remain linkable by consuming Angular applications. Framework-independent behavior continues to live in VyrnForge shared foundations and canonical elements.
