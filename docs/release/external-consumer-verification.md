# External Consumer Verification

External consumer verification proves that VyrnForge UI packages can be consumed
from packed artifacts outside the monorepo workspace graph. Native HTML, React,
Angular, and Vue are equal first-class product surfaces; individual fixtures may
exercise different package paths without implying a support hierarchy.

Run:

```bash
npm run verify:consumer
```

GitHub Actions invokes the reusable consumer workflow when the dependency-aware planner detects a public package, package payload, or consumer-fixture impact. The compatibility check `external-consumer` remains stable while branch protection migrates to the single `ci-gate`.

The command:

1. runs package verification, which cleans and builds all five publishable packages across the non-grid beta and independent grid-alpha groups;
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
import "@vyrnforge/ui-elements/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";

import { createBehaviorEvent } from "@vyrnforge/ui-behaviors";
import { createVyrnForgeTheme } from "@vyrnforge/ui-core";
import {
  Button,
  TextInput,
  AppShell,
  Page,
  Autocomplete,
} from "@vyrnforge/ui-components";
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
```

The fixture must not use TypeScript path aliases, workspace linking, `npm link`, `../../packages` imports, `packages/*/src` imports, or copied VyrnForge source.

This verification does not publish packages to npm and does not prove public registry availability. CV-006 remains the separate real-application validation step.

## CV-006 real-application validation

CV-006 is intentionally different from the packed consumer fixture above. It
requires an actual web application with its own application architecture and
real product workflows. Do not create another repository fixture, demo, or
synthetic sample and report it as real-application evidence.

A qualifying application must consume VyrnForge through public package
entrypoints from an approved released/prerelease artifact. For every VyrnForge
surface the application actually uses, record:

1. application repository and exact commit;
2. application framework, build tool, runtime, and relevant deployment mode;
3. exact VyrnForge package versions or approved artifacts installed;
4. public JavaScript and CSS entrypoints imported by the application;
5. production build result in the application's normal toolchain;
6. applicable SSR or server-import result;
7. representative event, form, and model integration with the application's
   real conventions;
8. confirmation that routing, backend calls, permissions, business validation,
   workflow state, and application stores remain application-owned;
9. keyboard and accessibility review in the application's real user workflows;
10. install or upgrade result plus rollback/migration result.

The evidence must describe observed application behavior and any limitations.
Packed fixtures, regression fixtures, documentation examples, or monorepo
workspace linking remain useful repository evidence but do not satisfy CV-006.

If no qualifying application is available, keep CV-006 open rather than
manufacturing one solely to satisfy the evidence checklist.
