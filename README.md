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
and behavior foundations plus first-class non-grid surfaces for React, Native
HTML / Custom Elements, Angular, and Vue. Angular and Vue are package-owned
facades over the same canonical Custom Element implementation rather than
separate VyrnForge component libraries.

The data grid is one optional specialized React capability on an independent
alpha track, not the definition of the library.

## Maturity and release channels

| Track           | Packages                                                                                                                                            | npm tag |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Non-grid beta   | `@vyrnforge/ui-core`, `@vyrnforge/ui-behaviors`, `@vyrnforge/ui-components`, `@vyrnforge/ui-elements`, `@vyrnforge/ui-angular`, `@vyrnforge/ui-vue` | `beta`  |
| Data-grid alpha | `@vyrnforge/ui-data-grid`                                                                                                                           | `alpha` |

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
| `@vyrnforge/ui-components` | First-class React package over shared VyrnForge foundations.                                                             |
| `@vyrnforge/ui-elements`   | First-class browser-native Custom Elements package over shared VyrnForge foundations.                                    |
| `@vyrnforge/ui-angular`    | First-class Angular facade over canonical VyrnForge Custom Elements.                                                     |
| `@vyrnforge/ui-vue`        | First-class Vue facade over canonical VyrnForge Custom Elements.                                                         |
| `@vyrnforge/ui-data-grid`  | Specialized React data-management grid on an independent alpha track.                                                    |

Native HTML, React, Angular, and Vue are first-class web surfaces. They share
canonical component, behavior, accessibility, styling, and terminology
contracts while remaining idiomatic to each framework. Future framework support
must follow the framework admission and evidence model rather than creating an
independent VyrnForge component library.

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

React:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta
```

Native HTML / Custom Elements:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta
```

Angular:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-angular@beta
```

Vue:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-vue@beta vue
```

Framework-neutral behavior APIs:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-behaviors@beta
```

React data grid:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

See [Import and Setup](docs/api/import-and-setup.md) for framework-specific
registration, framework Forms/model integration, CSS, SSR, and escape-hatch
guidance.

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

Angular and Vue use their public framework packages rather than copied
application adapters. See the package-specific docs for idiomatic setup and
framework integration details.

## Development

The normal root command surface is intentionally small:

```bash
npm ci
npm run check
npm run test
npm run build
```

`npm run ci` is the complete local equivalent of current full repository
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

Repository automation verifies the package and framework contracts described
above. Manual assistive-technology completion and external trusted-publisher
configuration remain separately governed release evidence and are not implied by
a green repository build alone.

## Licensing

VyrnForge UI is source-available under the
[VyrnForge Source License 1.0](LICENSE).

See [Commercial Licensing](docs/legal/commercial-licensing.md) for production,
commercial-use, redistribution, and licensing guidance.
