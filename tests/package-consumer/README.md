# External Package Consumer Fixture

This fixture verifies that VyrnForge UI can be consumed as packed packages from a clean, non-workspace Vite + React + TypeScript application.

Run it from the repository root:

```bash
npm run verify:consumer
```

The verifier builds and verifies the publishable packages, creates local tarballs in a temporary ignored directory, installs those tarballs into this fixture, runs TypeScript typecheck, runs a production Vite build, proves the installed VyrnForge packages are not workspace symlinks, and cleans temporary installation output afterward.

This does not publish packages to npm and does not test public registry installation. CV-006 remains the separate real-application validation step.

Supported public imports verified here:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";

import { createVyrnForgeTheme } from "@vyrnforge/ui-core";
import { Button, TextInput, AppShell, Page, Autocomplete } from "@vyrnforge/ui-components";
import { UniversalDataGrid, useDataGridState } from "@vyrnforge/ui-data-grid";
```

Do not add workspace aliases, `../../packages` imports, or `packages/*/src` imports to this fixture.
