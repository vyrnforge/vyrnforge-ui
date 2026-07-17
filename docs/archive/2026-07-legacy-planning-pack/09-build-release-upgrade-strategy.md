> Archived: This document is historical and no longer canonical.
> Replacement: ../../roadmap/00-master-roadmap.md

# 09 — Build, Release, and Upgrade Strategy

## Build goals

VyrnForge UI packages must be easy to build, test, pack, and upgrade across multiple consuming applications.

## Package build format

Each package should emit:

```txt
dist/index.js      ESM
 dist/index.cjs    CommonJS if needed
 dist/index.d.ts   TypeScript declarations
```

Recommended build tool:

```txt
tsup
```

## Package scripts

Each package should support:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
    "typecheck": "tsc --noEmit",
    "test": "vitest"
  }
}
```

## Root scripts

```json
{
  "scripts": {
    "build": "npm -ws run build",
    "typecheck": "npm -ws run typecheck",
    "test": "npm -ws run test",
    "build:playground": "npm -w examples/basic-playground run build"
  }
}
```

## Version strategy

Use semantic versioning.

During early development:

```txt
0.x = unstable public API
1.0 = stable public API
```

Suggested version milestones:

```txt
0.1.0 package skeleton
0.2.0 base grid
0.3.0 column management / theme / resizing
0.4.0 selection / grouping
0.5.0 server mode / export contract / saved views
1.0.0 stable API
```

## Upgrade principle

Never copy source code into every project.

Projects should consume packages:

```bash
npm install @dravyn/ui-data-grid
```

Then upgrade by package version:

```bash
npm install @dravyn/ui-data-grid@0.5.0
```

## Local testing

Before publishing:

```bash
npm pack
```

Install the `.tgz` file in a consuming project.

## Private registry options

Recommended options:

* GitHub Packages
* private npm registry
* Nexus
* Verdaccio
* GitLab Package Registry
* Azure Artifacts

## CI requirements

GitHub Actions should run:

```txt
npm ci
npm run typecheck
npm run test
npm run build
npm run build:playground
```

## Changelog

Every release should update:

```txt
CHANGELOG.md
MIGRATION.md if breaking changes exist
```

## Breaking change policy

Breaking changes require:

* version bump
* migration note
* before/after example
* reason for change
* affected packages

## Dependency policy

No heavy dependency should be added without a written reason.

Any new dependency must answer:

1. Why is native implementation insufficient?
2. Is this dependency required at runtime?
3. Can it be optional?
4. Does it affect bundle size?
5. Does it force styling/theming decisions?
6. Can it be replaced later?

## Release checklist

Before release:

```txt
npm run build
npm run typecheck
npm run test
npm run build:playground
npm pack
install packed package in external app
verify CSS import
verify TypeScript types
update changelog
create git tag
```
