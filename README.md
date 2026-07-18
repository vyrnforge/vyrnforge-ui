# VyrnForge UI

VyrnForge UI is a native-first, dependency-minimal enterprise React UI foundation. It is built for reusable application surfaces such as administration portals, customer portals, IAM and access-management applications, workflow systems, reporting and analytics screens, and data-heavy enterprise applications.

VyrnForge UI is not only a data-grid library. The data grid is one specialized package inside a broader UI foundation.

## Maturity

VyrnForge UI is currently pre-alpha.

- APIs may still change.
- Packages are not yet ready for production use.
- The first npm alpha release has not yet been completed.
- Public release and licensing terms are still being finalized.

## Packages

| Package | Responsibility |
| --- | --- |
| `@vyrnforge/ui-core` | Design tokens, themes, density, CSS variables, utilities, and shared foundations. |
| `@vyrnforge/ui-components` | Reusable React primitives and application components. |
| `@vyrnforge/ui-data-grid` | Enterprise data-management grid functionality. |

Intended dependency direction:

- `@vyrnforge/ui-core` remains independent.
- `@vyrnforge/ui-components` may depend on `@vyrnforge/ui-core`.
- `@vyrnforge/ui-data-grid` may depend on `@vyrnforge/ui-core` and `@vyrnforge/ui-components`.

## Installation

The packages are not published for public npm installation yet. The intended command for the first alpha release is:

```bash
npm install @vyrnforge/ui-core @vyrnforge/ui-components @vyrnforge/ui-data-grid
```

This command is planned for the first npm alpha and should not be read as a claim that the packages are already available on the public npm registry.

## CSS Setup

When using all packages together, import package-level CSS in this order:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
```

Shared VyrnForge UI styling uses `--vf-*` CSS variables and `vf-*` classes. Data-grid-specific styling uses `--udg-*` CSS variables and `udg-*` classes.

## Minimal Usage

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";

import { Button, Card, Stack } from "@vyrnforge/ui-components";
import {
  UniversalDataGrid,
  type DataGridColumnDef
} from "@vyrnforge/ui-data-grid";

type AccessRequest = {
  id: string;
  requester: string;
  status: string;
};

const rows: AccessRequest[] = [
  { id: "REQ-1001", requester: "Workspace owner", status: "Pending" },
  { id: "REQ-1002", requester: "Security reviewer", status: "Approved" }
];

const columns: DataGridColumnDef<AccessRequest>[] = [
  { id: "requester", header: "Requester", accessorKey: "requester" },
  { id: "status", header: "Status", accessorKey: "status" }
];

export function AccessRequestsPanel() {
  return (
    <Card variant="bordered" padding="md">
      <Stack gap="md">
        <Button variant="primary">Create request</Button>
        <UniversalDataGrid
          tableId="access-requests"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
        />
      </Stack>
    </Card>
  );
}
```

## Repository Structure

| Path | Purpose |
| --- | --- |
| `packages/` | Package workspaces for `ui-core`, `ui-components`, and `ui-data-grid`. |
| `docs/` | Canonical markdown documentation and AI-readable metadata. |
| `examples/basic-playground/` | Interactive playground source for component and grid examples. |
| `apps/docs/` | React documentation viewer over the markdown docs. |
| `.github/` | Repository automation and workflow configuration. |

Package tests live beside package source where present.

## Local Development

Prerequisites:

- Node.js `>=22.12 <25`; `.nvmrc` pins the default development major to Node 22.
- npm `>=10 <12`; this repository uses npm workspaces and `package-lock.json`.

Install dependencies:

```bash
npm install
```

Root scripts:

```bash
npm run build
npm run build:packages
npm run build:docs
npm run build:playground
npm run dev:docs
npm run dev:playground
npm run quality
npm run typecheck
npm run test
```

## Documentation And Playground

- Documentation index: [docs/README.md](docs/README.md)
- API setup guide: [docs/api/import-and-setup.md](docs/api/import-and-setup.md)
- Package docs: [docs/packages/](docs/packages/)
- Release governance: [docs/release/README.md](docs/release/README.md)
- Playground source: [examples/basic-playground/](examples/basic-playground/)
- Docs app source: [apps/docs/](apps/docs/)
- Agent context: [AGENTS.md](AGENTS.md) and [.ai/AI_CONTEXT.md](.ai/AI_CONTEXT.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

Public GitHub Pages links are intentionally omitted until Pages deployment is complete.

Release policy, versioning, publication procedure, deprecation rules, and release readiness are documented under [docs/release/](docs/release/).

## Contribution And Security

Contribution guidance exists in [CONTRIBUTING.md](CONTRIBUTING.md). Security reporting guidance exists in [SECURITY.md](SECURITY.md).

## Ownership

VyrnForge UI is maintained as part of the VyrnForge UI repository.
