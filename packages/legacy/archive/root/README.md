# VyrnForge UI

VyrnForge UI is a dependency-minimal, general-purpose, enterprise-grade UI
library and UI foundation. VyrnForge itself is the product: Native HTML / Custom
Elements, React, Angular, and Vue are equal first-class consumption surfaces
over one contract-driven design, behavior, accessibility, styling, and component
foundation.

The product spans lightweight primitives, application components, reusable
patterns, and optional advanced UI capabilities. Capability breadth does not
mean every consumer must install heavyweight modules or framework integrations
they do not use.

## Current implementation

VyrnForge UI is prerelease software. The repository ships shared design and
behavior foundations plus first-class non-grid surfaces for Native HTML / Custom
Elements, React, Angular, and Vue. Internal implementation reuse between those
surfaces does not create a product hierarchy.

Data Grid is one optional advanced VyrnForge UI module, not a fifth framework
surface and not the definition of the library. Its currently shipped package is
React-only alpha; that is a present implementation limitation rather than the
target product hierarchy.

## Maturity and release channels

<!-- prettier-ignore -->
| Track | Packages | npm tag |
| --- | --- | --- |
| Non-grid beta | `@vyrnforge/ui-core`, `@vyrnforge/ui-behaviors`, `@vyrnforge/ui-components`, `@vyrnforge/ui-elements`, `@vyrnforge/ui-angular`, `@vyrnforge/ui-vue` | `beta` |
| Data-grid alpha | `@vyrnforge/ui-data-grid` | `alpha` |

Use explicit prerelease tags. A registry-managed `latest` tag is not a VyrnForge
stability signal while packages remain prerelease. Component maturity is owned
by [`docs/metadata/components.json`](docs/metadata/components.json); release-line
versions and dependency rules are owned by
[`docs/release/versioning-policy.md`](docs/release/versioning-policy.md) and
canonical release metadata.

## Packages

Choose the first-class surface package for the framework your application uses.
Shared foundation packages are dependencies of those surfaces and are also
available when consuming framework-neutral VyrnForge APIs directly.

<!-- prettier-ignore -->
| Package | Responsibility |
| --- | --- |
| `@vyrnforge/ui-core` | Framework-neutral design tokens, themes, density, typography, motion, layers, utilities, and shared styling foundations. |
| `@vyrnforge/ui-behaviors` | Framework-neutral state, collections, selection, navigation, overlays, forms, feedback, and reasoned events. |
| `@vyrnforge/ui-elements` | First-class Native HTML / Custom Elements surface and reusable browser implementation where appropriate. |
| `@vyrnforge/ui-components` | Current React package name and first-class React-facing API over shared VyrnForge foundations; it does not own canonical component semantics. |
| `@vyrnforge/ui-angular` | First-class Angular-facing API over shared VyrnForge contracts and implementation foundations. |
| `@vyrnforge/ui-vue` | First-class Vue-facing API over shared VyrnForge contracts and implementation foundations. |
| `@vyrnforge/ui-data-grid` | Optional advanced Data Grid module on an independent React-only alpha release track today. |

Native HTML / Custom Elements, React, Angular, and Vue share canonical component,
behavior, accessibility, styling, and terminology contracts while remaining
idiomatic to each framework. Package reuse or renderer strategy does not rank one
surface above another.

## Installation

React:

```bash
npm install @vyrnforge/ui-components@beta
```

Native HTML / Custom Elements:

```bash
npm install @vyrnforge/ui-elements@beta
```

Angular:

```bash
npm install @vyrnforge/ui-angular@beta
```

Vue:

```bash
npm install @vyrnforge/ui-vue@beta vue
```

Applications intentionally consuming framework-neutral behavior APIs can install
`@vyrnforge/ui-behaviors@beta` directly. Applications using the currently
shipped Data Grid add `@vyrnforge/ui-data-grid@alpha`.

See [Import and Setup](docs/api/import-and-setup.md) for registration,
framework forms/model integration, CSS behavior, SSR, peers, and escape-hatch
guidance.

## Minimal usage

React:

```tsx
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

Native HTML / Custom Elements:

```ts
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
```

```html
<vf-button variant="primary">Save changes</vf-button>
```

Angular and Vue applications use their public framework packages rather than
copied application adapters. Package-specific documentation contains their
idiomatic setup and integration guidance.

## Development

The normal root command surface is intentionally small:

```bash
npm ci
npm run check
npm test
npm run build
```

`npm run ci` is the complete local full-repository validation path. Internal
verification commands remain available for repository automation but are not the
normal contributor entrypoints.

Repository work uses short-lived branches and reviewed pull requests. `main` is
the canonical releasable branch. Real dependencies may use bounded stacked PRs,
and temporary `integration/<initiative>` branches are allowed only when an
initiative genuinely needs combined integration. See
[Trunk Delivery](docs/governance/05-trunk-delivery.md) for the canonical branch,
PR, CI, merge, release, and backport model.

## Documentation

Use [docs/README.md](docs/README.md) as the canonical documentation entrypoint.
The authoritative product identity and durable scope live in
[Project Source of Truth](docs/governance/01-project-source-of-truth.md).

Maintainer documentation is source-of-truth oriented:

- [Package boundaries](docs/architecture/01-package-boundaries.md)
- [Trunk delivery and PR topology](docs/governance/05-trunk-delivery.md)
- [CI/CD architecture](docs/engineering/ci-cd-architecture.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Licensing](LICENSE)

The reader-facing VyrnForge Reference is built from canonical documentation,
metadata, generated facts, and verified examples. It is a presentation product,
not a second semantic source of truth.

Repository automation verifies package and framework contracts. Manual
assistive-technology completion and external trusted-publisher configuration
remain separately governed release evidence and are not implied by a green
repository build alone.

## Licensing

VyrnForge UI is source-available under the
[VyrnForge Source License 1.0](LICENSE).

See [Commercial Licensing](docs/legal/commercial-licensing.md) for production,
commercial-use, redistribution, and licensing guidance.
