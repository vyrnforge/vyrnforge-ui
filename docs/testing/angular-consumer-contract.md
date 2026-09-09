# Angular Consumer Contract

The Angular consumer contract verifies `@vyrnforge/ui-angular` as the first-class Angular facade over VyrnForge's canonical Custom Element implementation. The machine-readable fixture source of truth is `docs/metadata/angular-consumer.json`; package support evidence is recorded in `docs/metadata/angular-support-evidence.json`.

## Supported fixture line

The fixture pins Angular 22.0.8 and TypeScript 6.0.2. It remains outside the VyrnForge npm workspace so packed-runtime evidence cannot be satisfied by workspace links.

## Normal application contract

`tests/consumers/angular` proves the package-owned facade path:

1. clean Angular dependency installation;
2. clean installation from packed VyrnForge package artifacts including `@vyrnforge/ui-angular`;
3. no workspace symlink, repository-source import, or fixture-local facade copy;
4. application setup through `provideVyrnForge()` without `CUSTOM_ELEMENTS_SCHEMA`;
5. generated `Vf*` directives/components and package-owned TypeScript declarations;
6. scalar, object, and collection property binding without attribute serialization;
7. typed Angular-facing outputs plus canonical `vf-*` DOM-event interoperability;
8. named Light DOM composition and projected content;
9. typed references and supported imperative methods;
10. native `ElementInternals` form submission and validity semantics;
11. strict template compilation, production build, packed-runtime verification, and Chromium interaction.

Raw `<vf-*>` templates remain a Native HTML interoperability escape hatch. Normal Angular consumption uses the generated `@vyrnforge/ui-angular` facade and does not require consumers to recreate registration or schema glue.

## Forms boundary

`@vyrnforge/ui-angular/forms` provides the opt-in `VyrnForgeFormControlDirective` integration for Angular `ControlValueAccessor`, reactive forms, template-driven forms, touched and disabled state, and native validation. Rendering, validation semantics, and form association remain owned by the canonical VyrnForge foundations. The detailed contract is `docs/testing/angular-forms-adapter-contract.md`.

## Required commands

```bash
npm run test:angular-consumer
npm run verify:angular-consumer
npm run verify:angular-consumer:runtime
npm run quality
```

Historical CF-7003/CF-7004 fixture evidence established the original packed Angular consumer and Forms bridge. Current support status is first-class package support and is governed by the current multi-framework metadata and Angular support evidence, not by the historical consumer-only stage.
