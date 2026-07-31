# SSR and Bundler Compatibility Contract

CF-7007 verifies that the beta release-group packages can be imported in a
server process before browser registration/runtime execution and that the
existing packed consumer fixtures build through their real toolchains.

## Server import contract

The matrix runs both ESM `import()` and CommonJS `require()` with browser DOM
globals absent. It covers `@vyrnforge/ui-core`, `@vyrnforge/ui-behaviors`,
`@vyrnforge/ui-components`, `@vyrnforge/ui-elements`, and the explicit
`@vyrnforge/ui-elements/register` entry point. The registration entry point must
be a server-safe no-op when `customElements` is unavailable.

The React leg additionally renders a `Button` with `react-dom/server` to prove
the reference renderer can execute during server rendering without a DOM.

## Bundler matrix

- native HTML: Vite;
- React: Vite, including a packed `@vyrnforge/ui-components` tarball;
- Angular: Angular CLI application builder;
- Vue: strict `vue-tsc` followed by Vite.

Every fixture receives only the packed VyrnForge packages it actually consumes.
This prevents the React renderer and its peer dependencies from contaminating
native HTML, Angular, or Vue verification.

## Commands

```bash
npm run test:ssr-bundler
npm run verify:ssr-bundler
npm run verify:ssr-bundler:runtime
npm run quality
```

The clean packed build/SSR matrix passes on the supported Node 24 / npm 11 toolchain and records CF-7007 as evidence-complete.
