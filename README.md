# VyrnForge UI

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation for
administration portals, customer portals, IAM and access-management systems,
internal tools, workflow applications, reporting screens, dashboards, and
data-heavy enterprise applications.

It provides shared design foundations, framework-neutral behavior, reusable
React components, browser-native Custom Elements, and a specialized React data
grid. The data grid is one package in the wider VyrnForge foundation, not the
definition of the library.

## Maturity and release channels

VyrnForge UI is prerelease software.

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
| `@vyrnforge/ui-components` | First-class React primitives and enterprise application components.                                                      |
| `@vyrnforge/ui-elements`   | First-class browser-native Custom Elements over the shared VyrnForge foundations.                                        |
| `@vyrnforge/ui-data-grid`  | Specialized React enterprise data-management grid on an independent alpha track.                                         |

React and native HTML are first-class web renderers. Angular and Vue are
verified consumers of the native Custom Element renderer through thin
framework-integration patterns rather than separate VyrnForge component
libraries.

## Installation

React:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta
```

Native HTML Custom Elements:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta
```

Framework-neutral behavior APIs:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-behaviors@beta
```

React data grid:

```bash
npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta @vyrnforge/ui-data-grid@alpha
```

See [Import and Setup](docs/api/import-and-setup.md) for registration, CSS
imports, Angular/Vue integration, and package-specific guidance.

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
