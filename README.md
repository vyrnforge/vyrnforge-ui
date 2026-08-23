# VyrnForge UI

VyrnForge UI is a native-owned, dependency-minimal, general-purpose UI system
with enterprise-grade depth. It provides one contract-driven design, behavior,
and accessibility foundation across supported web frameworks while keeping
framework runtimes, application state, and business logic outside the shared
core.

The long-term product direction spans lightweight primitives, application
components, reusable patterns, and optional advanced UI capabilities. Capability
breadth does not mean every consumer must install heavyweight modules or
framework integrations they do not use.

## Current implementation

VyrnForge UI is prerelease software. The current repository ships shared design
and behavior foundations, first-class React and native HTML packages, and a
specialized React data grid. Angular and Vue are approved first-class target
surfaces and currently remain verified consumers of the native Custom Element
foundation while their official facade packages are completed through S12 and
S13.

The data grid is one optional specialized capability in the wider VyrnForge UI
system, not the definition of the library.

## Maturity and release channels

| Track           | Packages                                                                                              | npm tag |
| --------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| Non-grid beta   | `@vyrnforge/ui-core`, `@vyrnforge/ui-behaviors`, `@vyrnforge/ui-components`, `@vyrnforge/ui-elements` | `beta`  |
| Data-grid alpha | `@vyrnforge/ui-data-grid`                                                                             | `alpha` |

Use explicit prerelease tags. A registry-managed `latest` tag is not a
VyrnForge stability signal while the packages remain prerelease. Component
maturity is tracked independently in
[`docs/metadata/components.json`](docs/metadata/components.json).

See the [versioning policy](docs/release/versioning-policy.md) for the canonical
release-group versions and dependency rules.

## Packages

| Package                    | Responsibility                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `@vyrnforge/ui-core`       | Framework-neutral design tokens, themes, density, typography, motion, layers, utilities, and shared styling foundations. |
| `@vyrnforge/ui-behaviors`  | Framework-neutral state, collections, selection, navigation, overlays, form behavior, feedback, and reasoned events.     |
| `@vyrnforge/ui-components` | Current first-class React package over shared VyrnForge foundations.                                                     |
| `@vyrnforge/ui-elements`   | Current first-class browser-native Custom Elements package over shared VyrnForge foundations.                            |
| `@vyrnforge/ui-data-grid`  | Specialized React data-management grid on an independent alpha track.                                                    |

The approved first-class web target is Native HTML, React, Angular, and Vue.
Supported framework surfaces share canonical component, behavior,
accessibility, styling, and terminology contracts while remaining idiomatic to
each framework. Future framework support must follow the framework admission
and evidence model rather than creating an independent VyrnForge component
library.

## Product principles

- Native-owned means VyrnForge owns its UI implementation rather than wrapping
  another large UI library; it does not mean Native HTML is the only first-class
  surface.
- Shared contracts, metadata, tokens, behaviors, accessibility semantics, and
  generation stay framework-neutral where practical.
- Framework packages are adapters/facades over shared VyrnForge foundations,
  with narrow evidence-backed exceptions when required.
- Optional advanced capabilities must not make unrelated consumers pay their
  dependency, runtime, CSS, or bundle cost.
- Application state management, authentication, backend services, business
  workflow execution, and other application/runtime semantics remain outside
  VyrnForge.
- Public metadata and contracts should serve both human developers and AI
  systems without creating parallel sources of truth.

## Installation

Current React package:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta
```

Current Native HTML Custom Elements package:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta
```

Framework-neutral behavior APIs:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-behaviors@beta
```

Current React data grid:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

Angular and Vue currently use the verified native integration path documented in
[Import and Setup](docs/api/import-and-setup.md). Their approved official
first-class package paths become the normal installation path only after the
corresponding framework release gates pass.

## Minimal usage

React:

```tsx
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";

import { Button, Card, Stack } from "@vyrnforge/ui-components";

export function ActionsPanel() {
  return (
    <Card variant="bordered" padding="md">
      <Stack gap="md">
        <Button variant="primary">Save changes</Button>
      </Stack>
    </Card>
  );
}
```

Native HTML:

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

## Development

The normal root command surface is intentionally small:

```bash
npm ci
npm run check
npm run test
npm run build
```

`npm run ci` is the complete local equivalent of current main-branch
validation. Internal verification commands remain available for repository
automation, but they are not the normal contributor entrypoints.

## Documentation

Use [docs/README.md](docs/README.md) as the canonical documentation entrypoint.
The authoritative product identity and scope live in
[Project Source of Truth](docs/governance/01-project-source-of-truth.md).

- [Use VyrnForge](docs/README.md#use-vyrnforge)
- [Build VyrnForge](docs/README.md#build-vyrnforge)
- [Maintain VyrnForge](docs/README.md#maintain-vyrnforge)
- [Project planning](docs/README.md#project-planning)
- [Historical evidence](docs/README.md#historical-evidence)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Licensing](LICENSE)

The human-facing documentation and playground are published through the
repository's GitHub Pages site.

## Licensing

VyrnForge UI is source-available under the
[VyrnForge Source License 1.0](LICENSE).

See [Commercial Licensing](docs/legal/commercial-licensing.md) for production,
commercial-use, redistribution, and licensing guidance.
