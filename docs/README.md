# VyrnForge UI Documentation

Use this index to find the canonical source for a topic. Do not create a second source of truth when an existing document or generated artifact already owns it.

## Use VyrnForge

- [Install and setup](api/import-and-setup.md)
- [Public API reference](api/README.md)
- [Generated component reference](generated/component-reference.json)
- [Known limitations](quality/03-known-limitations.md)
- [Theming and styling](architecture/03-theming-and-styling.md)
- [CSS tokens](api/css-token-reference.md) and [public CSS classes](api/css-class-reference.md)
- [Multi-framework migration and limitations](release/multi-framework-migration-and-limitations.md)
- Framework packages: [Angular](packages/ui-angular.md), [Vue](packages/ui-vue.md), [React/components](packages/ui-components.md), and [Native/Custom Elements](packages/ui-elements.md)
- Specialized package: [Data Grid](packages/ui-data-grid.md)

## Build VyrnForge

Start with [CONTRIBUTING.md](../CONTRIBUTING.md), then use the source that owns the area you are changing.

- [Project scope](governance/01-project-source-of-truth.md)
- [System overview](architecture/00-system-overview.md)
- [Package boundaries](architecture/01-package-boundaries.md)
- [State and adapter ownership](architecture/02-state-and-adapter-ownership.md)
- [Accessibility standards](architecture/05-accessibility-standards.md)
- [Semantic token contract](architecture/08-semantic-token-contract.md)
- [Component contracts and events](architecture/09-component-contracts-and-events.md)
- [Custom Elements and form association](architecture/10-custom-elements-and-form-association.md)
- [Browser testing](testing/browser-testing.md) and [visual regression](testing/visual-regression.md)

Current component maturity and catalog facts are owned by [`metadata/components.json`](metadata/components.json). Generated framework/component views must derive from canonical metadata rather than repeat those facts by hand.

## Maintain VyrnForge

- [Documentation governance](governance/00-documentation-governance.md) and [document lifecycle](governance/02-document-lifecycle.md)
- [Trunk and integration-lane delivery](governance/05-trunk-delivery.md)
- [CI/CD architecture](engineering/ci-cd-architecture.md)
- [Quality gates](quality/00-quality-gates.md)
- [Release documentation](release/README.md) and [publication procedure](release/publication-procedure.md)
- [Repository inventory](governance/repository-inventory.md)
- [AGENTS.md](../AGENTS.md) for repository coding-agent rules

The live Google Drive spreadsheet **VyrnForge Progress Tracker — Live Status** owns active sprint execution, task status, dependencies, acceptance criteria, sequencing, validation requirements, and gate status. GitHub does not maintain a competing sprint tracker.

## Machine-readable sources

- Package metadata: [`metadata/packages.json`](metadata/packages.json)
- Component catalog and maturity: [`metadata/components.json`](metadata/components.json)
- Generated component/framework reference: [`generated/component-reference.json`](generated/component-reference.json)
- Generated AI context: [`generated/ai-context/index.json`](generated/ai-context/index.json)

Historical task narratives and reproducible audit reports are not current documentation. Keep them only when they retain explicit release, migration, regression, security, or architectural value; otherwise Git history is the recovery path.
