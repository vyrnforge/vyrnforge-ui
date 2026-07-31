# Angular Consumer Contract

CF-7003 verifies Angular as a packed consumer of the framework-neutral native
renderer. The machine-readable source of truth is
`docs/metadata/angular-consumer.json`.

## Supported fixture line

The fixture pins Angular 22.0.8 and TypeScript 6.0.2. Angular 22.0.x supports
Node 24.15 or later on the Node 24 line and requires TypeScript 6.0.x. The
fixture therefore remains outside the VyrnForge npm workspace, whose root
compiler is TypeScript 7.

## Angular references

- https://angular.dev/reference/versions
- https://angular.dev/guide/components/advanced-configuration
- https://angular.dev/tools/cli/build-system-migration

## Runtime contract

`tests/consumers/angular` must prove:

1. clean Angular dependency installation;
2. clean installation of packed `ui-core`, `ui-behaviors`, and `ui-elements`;
3. no workspace symlink or repository-source import;
4. `CUSTOM_ELEMENTS_SCHEMA` on a standalone component;
5. explicit `@vyrnforge/ui-elements/register` registration;
6. scalar attribute and object property binding;
7. canonical DOM event binding through `(vf-action)`;
8. named Light DOM composition;
9. native `ElementInternals` form submission;
10. strict template compilation, production build, and Chromium interaction.

## Form boundary

CF-7003 verifies native form association inside an Angular application. CF-7004
adds the separate opt-in `VyrnForgeFormControlDirective` reference adapter for
Angular `ControlValueAccessor`, reactive forms, template-driven forms, touched
and disabled state, and native validation integration. The canonical adapter
contract is `docs/testing/angular-forms-adapter-contract.md`.

## Required commands

```bash
npm run test:angular-consumer
npm run verify:angular-consumer
npm run verify:angular-consumer:runtime
npm run quality
```

GMF4 remains in progress. CF-7005 supplies the Vue packed-consumer fixture and
runtime verifier, but clean build and Chromium evidence remain pending. Vue
`v-model`, the shared browser and accessibility matrices, documentation
generation, and final compatibility review remain S7 work.
