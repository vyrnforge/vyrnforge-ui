# VyrnForge UI

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation with a first-class React renderer and a native Custom Element foundation. It is built for reusable application surfaces such as administration portals, customer portals, IAM and access-management applications, workflow systems, reporting and analytics screens, and data-heavy enterprise applications.

VyrnForge UI is not only a data-grid library. The data grid is one specialized package inside a broader UI foundation.

## Maturity

VyrnForge UI is currently in an early alpha prerelease stage.

- APIs may still change.
- Packages are not yet ready for production use.
- `@vyrnforge/ui-core@0.1.0-alpha.0` is the historical first public prerelease.
- `0.1.0-alpha.1` is the initial coordinated alpha prerelease, published
  manually for all three packages with the `alpha` tag.
- Future coordinated prereleases use the controlled GitHub Actions workflow,
  npm OIDC trusted publishing, registry verification, and an automated Git tag
  plus GitHub prerelease record.
- The explicit prerelease tag (`alpha`, `beta`, or `next`) is authoritative.
  npm may retain a registry-managed `latest` tag, but it is not a stability
  signal during prerelease.
- VyrnForge UI is source-available under the VyrnForge Source License 1.0.
- Production use and commercial use require a separate written commercial license.

## Packages

| Package                    | Responsibility                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `@vyrnforge/ui-core`       | Framework-neutral design tokens, themes, density, typography, motion, layers, utilities, and shared foundations.            |
| `@vyrnforge/ui-behaviors`  | Framework-neutral state, collections, selection, action, toggle, choice, numeric, Tabs, subscriptions, and behavior events. |
| `@vyrnforge/ui-components` | First-class React primitives and application components.                                                                    |
| `@vyrnforge/ui-elements`   | Native Custom Element foundation for plain HTML and future verified Angular/Vue consumption.                                |
| `@vyrnforge/ui-data-grid`  | Existing React enterprise data-management grid on a separate alpha track.                                                   |

Intended dependency direction:

- `@vyrnforge/ui-core` remains independent and framework-neutral.
- `@vyrnforge/ui-behaviors` foundation may depend on `@vyrnforge/ui-core` only.
- `@vyrnforge/ui-components` may depend on `ui-core` and `ui-behaviors`.
- `@vyrnforge/ui-elements` foundation may depend on `ui-core` and `ui-behaviors` without a framework runtime.
- `@vyrnforge/ui-data-grid` may depend on `ui-core` and `ui-components` and remains outside the non-grid beta group.

## Multi-Framework Beta Direction

The active release program prioritizes all public non-grid components:

- React remains the reference renderer through `@vyrnforge/ui-components`.
- Native HTML becomes first-class through `@vyrnforge/ui-elements` foundation.
- Angular and Vue are verified consumers of the native element surface.
- Shared component state and behavior move into `@vyrnforge/ui-behaviors`; MF-5001–MF-5010 foundations and React migrations through Autocomplete, MultiSelect, and Transfer List are implemented.
- The data grid remains usable as a React alpha and does not block the non-grid beta.

Architecture fixtures do not claim framework support. Clean consumer builds,
browser behavior, accessibility, typing, packaging, and documentation must pass
GMF4 before a framework is marked beta-supported.

## Installation

The coordinated packages are available as an early alpha prerelease. Install
through the explicit prerelease channel:

```bash
npm install @vyrnforge/ui-core@alpha @vyrnforge/ui-components@alpha @vyrnforge/ui-data-grid@alpha
```

Do not treat a bare install or npm's registry-managed `latest` tag as a stable
release signal while VyrnForge UI remains in alpha.

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
  type DataGridColumnDef,
} from "@vyrnforge/ui-data-grid";

type AccessRequest = {
  id: string;
  requester: string;
  status: string;
};

const rows: AccessRequest[] = [
  { id: "REQ-1001", requester: "Workspace owner", status: "Pending" },
  { id: "REQ-1002", requester: "Security reviewer", status: "Approved" },
];

const columns: DataGridColumnDef<AccessRequest>[] = [
  { id: "requester", header: "Requester", accessorKey: "requester" },
  { id: "status", header: "Status", accessorKey: "status" },
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

| Path                         | Purpose                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `packages/`                  | Current package workspaces plus the approved future `ui-behaviors` and `ui-elements` boundaries. |
| `docs/`                      | Canonical markdown documentation and AI-readable metadata.                                       |
| `examples/basic-playground/` | Interactive playground source for component and grid examples.                                   |
| `apps/docs/`                 | React documentation viewer over the markdown docs.                                               |
| `tests/consumers/`           | React, native HTML, Angular, and Vue integration-contract fixtures.                              |
| `.github/`                   | Repository automation and workflow configuration.                                                |

Package tests live beside package source where present.

## Local Development

Prerequisites:

- Node.js `>=24.18 <25`; `.nvmrc` and `.node-version` pin Node `24.18.0`.
- npm `>=11.16 <12`; `packageManager` pins npm `11.16.0`.
- TypeScript is pinned to `7.0.2` across the workspace. Published packages declare Node.js `>=22.12 <25` as their intended consumer compatibility target; complete Node 22 and Node 24 verification is deferred to VF-7001 and VF-7002.

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
npm run clean:packages
npm run dev:docs
npm run dev:playground
npm run quality
npm run typecheck
npm run test
npm run verify:consumer
npm run verify:packages
npm run verify:multi-framework
npm run verify:toolchain
```

## Documentation And Playground

- Documentation index: [docs/README.md](docs/README.md)
- API setup guide: [docs/api/import-and-setup.md](docs/api/import-and-setup.md)
- Package docs: [docs/packages/](docs/packages/)
- Commercial licensing overview: [docs/legal/commercial-licensing.md](docs/legal/commercial-licensing.md)
- Release governance: [docs/release/README.md](docs/release/README.md)
- External consumer verification: [docs/release/external-consumer-verification.md](docs/release/external-consumer-verification.md)
- CI/CD architecture: [docs/engineering/ci-cd-architecture.md](docs/engineering/ci-cd-architecture.md)
- Release responsibility matrix: [docs/release/release-responsibility-matrix.md](docs/release/release-responsibility-matrix.md)
- Playground source: [examples/basic-playground/](examples/basic-playground/)
- Docs app source: [apps/docs/](apps/docs/)
- Public documentation: [vyrnforge.github.io/vyrnforge-ui/](https://vyrnforge.github.io/vyrnforge-ui/)
- Public playground: [vyrnforge.github.io/vyrnforge-ui/playground/](https://vyrnforge.github.io/vyrnforge-ui/playground/)
- Agent context: [AGENTS.md](AGENTS.md) and [.ai/AI_CONTEXT.md](.ai/AI_CONTEXT.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

Release policy, versioning, publication procedure, deprecation rules, and release readiness are documented under [docs/release/](docs/release/).

## Contribution And Security

Contribution guidance exists in [CONTRIBUTING.md](CONTRIBUTING.md). Security reporting guidance exists in [SECURITY.md](SECURITY.md).

## Licensing

VyrnForge UI is source-available under the [VyrnForge Source License 1.0](LICENSE). The license permits source inspection, local evaluation, and temporary non-production prototypes.

Production use, commercial use, redistribution, package republication, resale, sublicensing, white-labeling, and use in competing UI, component, or data-grid products require separate written permission or a separate written commercial license. See the [commercial licensing overview](docs/legal/commercial-licensing.md) for a concise explanation.

## Ownership

VyrnForge UI is maintained as part of the VyrnForge UI repository.
