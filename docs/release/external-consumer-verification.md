# External Consumer Verification

External consumer verification proves that VyrnForge UI packages can be consumed from packed artifacts by a minimal application outside the monorepo workspace graph.

Run:

```bash
npm run verify:consumer
```

GitHub Actions invokes the reusable consumer workflow when the dependency-aware planner detects a public package, package payload, or consumer-fixture impact. The compatibility check `external-consumer` remains stable while branch protection migrates to the single `ci-gate`.

The command:

1. runs package verification, which cleans and builds `@vyrnforge/ui-core`, `@vyrnforge/ui-components`, and `@vyrnforge/ui-data-grid`;
2. creates local package tarballs in an ignored temporary directory;
3. installs those tarballs into `tests/package-consumer`;
4. installs React and ReactDOM as normal consumer dependencies;
5. verifies the installed VyrnForge package paths are not workspace symlinks;
6. verifies package metadata, LICENSE files, runtime files, declaration files, and CSS exports;
7. runs consumer TypeScript typecheck;
8. runs a production Vite build;
9. verifies the built CSS contains shared `--vf-*` and grid-specific `--udg-*` variables;
10. removes temporary tarballs, consumer `node_modules`, consumer `dist`, and generated consumer lockfiles.

The consumer fixture may import only public package entry points:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";

import { createVyrnForgeTheme } from "@vyrnforge/ui-core";
import { Button, TextInput, AppShell, Page, Autocomplete } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

The fixture must not use TypeScript path aliases, workspace linking, `npm link`, `../../packages` imports, `packages/*/src` imports, or copied VyrnForge source.

This verification does not publish packages to npm and does not prove public registry availability. CV-006 remains the separate real-application validation step.
