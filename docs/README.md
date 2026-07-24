# VyrnForge UI Documentation Index

This is the canonical documentation entrypoint for VyrnForge UI.

Do not create new top-level documentation without linking it from this file. If a new document overlaps with an existing document, update the existing canonical document instead of creating another competing source of truth.

## 1. Governance

| Document                                        | Purpose                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `governance/00-documentation-governance.md`     | Rules for creating, updating, archiving, and avoiding duplicate docs.                                         |
| `governance/01-project-source-of-truth.md`      | Canonical definition of what VyrnForge UI is and is not.                                                      |
| `governance/02-document-lifecycle.md`           | Draft/stable/deprecated/archive lifecycle.                                                                    |
| `governance/03-naming-and-terminology.md`       | Required package names, prefixes, and vocabulary.                                                             |
| `governance/04-metadata-maintenance.md`         | Rules for keeping AI-readable metadata aligned with docs and package APIs.                                    |
| `governance/ownership-and-review-model.md`      | Canonical workstream accountability, review triggers, and escalation model.                                   |
| `governance/component-maturity-model.md`        | Canonical component lifecycle, evidence, promotion, demotion, and release expectations.                       |
| `governance/repository-hygiene.md`              | Tracked-artifact hygiene policy and the latest cleanup record.                                                |
| `governance/repository-inventory.md`            | Generated evidence-led inventory of repository structure, public components, tests, workflows, and ownership. |
| `governance/controlled-implementation-rules.md` | Operational task, scope, review, and merge rules for controlled implementation work.                          |

## 2. Architecture

| Document                                                  | Purpose                                                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `architecture/00-system-overview.md`                      | High-level package architecture.                                                                         |
| `architecture/01-package-boundaries.md`                   | What each package owns and must not own.                                                                 |
| `architecture/02-state-and-adapter-ownership.md`          | State distribution, adapters, and Redux policy.                                                          |
| `architecture/03-theming-and-styling.md`                  | CSS variable, token, and styling rules.                                                                  |
| `architecture/04-clean-code-boundaries.md`                | Components vs hooks vs core vs adapters.                                                                 |
| `architecture/05-accessibility-standards.md`              | Accessibility baseline.                                                                                  |
| `architecture/06-css-architecture.md`                     | CSS ownership, split policy, prefixes, and package-level style imports.                                  |
| `architecture/07-overlay-and-focus.md`                    | Portal, dismissal, focus, scroll-lock, positioning, and z-index rules for overlays.                      |
| `architecture/08-semantic-token-contract.md`              | Canonical S3 semantic roles, compatibility bridges, density, typography, motion, and layers.             |
| `architecture/adr-004-multi-framework-web-support.md`     | Accepted React/native-first web support decision and deferred grid scope.                                |
| `architecture/09-component-contracts-and-events.md`       | Canonical properties, events, composition regions, methods, and renderer mapping.                        |
| `architecture/10-custom-elements-and-form-association.md` | Light DOM, Custom Element lifecycle, and native form-association policy.                                 |
| `engineering/ci-cd-architecture.md`                       | Dependency-aware CI, reusable workflows, permission boundaries, Pages, releases, and nightly validation. |

## 3. Roadmap

| Document                            | Purpose                                         |
| ----------------------------------- | ----------------------------------------------- |
| `roadmap/00-master-roadmap.md`      | Sprint-level execution plan.                    |
| `roadmap/01-component-inventory.md` | Current/planned components and maturity status. |
| `roadmap/02-gap-analysis.md`        | Missing areas and priorities.                   |
| `roadmap/03-do-not-build-yet.md`    | Explicit non-goals and deferred work.           |

## 4. Package Docs

| Document                    | Purpose                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `packages/ui-core.md`       | Tokens, themes, density, utilities.                                                |
| `packages/ui-behaviors.md`  | Current framework-neutral behavior foundations and first React adapter migrations. |
| `packages/ui-components.md` | Shared React primitives and application components.                                |
| `packages/ui-elements.md`   | Planned native Custom Element renderer boundary.                                   |
| `packages/ui-data-grid.md`  | UniversalDataGrid package scope and API direction.                                 |

## 5. API Reference

API docs define public package usage for humans and AI agents. Use `api/README.md` before consuming VyrnForge components, tokens, grid contracts, or adapter contracts. Metadata remains the structured AI index.

| Document                                      | Purpose                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| `api/README.md`                               | Public API overview and index.                                                   |
| `api/import-and-setup.md`                     | Package import and CSS setup order.                                              |
| `api/ui-core-api.md`                          | Public `@vyrnforge/ui-core` token, theme, density, and utility API.              |
| `api/ui-behaviors-api.md`                     | Public framework-neutral state, action, choice, numeric, Tabs, and event API.    |
| `api/ui-components-api.md`                    | Public `@vyrnforge/ui-components` component API overview.                        |
| `api/ui-data-grid-api.md`                     | Public `@vyrnforge/ui-data-grid` grid, state, adapter, and styling API overview. |
| `api/css-token-reference.md`                  | Stable public CSS variables.                                                     |
| `api/css-class-reference.md`                  | Public class prefixes and extension rules.                                       |
| `api/public-vs-internal-api.md`               | What is stable public API and what is internal.                                  |
| `components/forms/autocomplete.md`            | Experimental searchable single-value combobox guidance.                          |
| `components/data-management/transfer-list.md` | Experimental bounded dual-list assignment guidance.                              |
| `components/feedback/toast.md`                | Experimental transient feedback and toast provider guidance.                     |

## 6. Benchmark And Positioning

| Document                                         | Purpose                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `benchmark/00-ui-library-landscape.md`           | Comparison against major UI library categories.                                  |
| `benchmark/01-VyrnForge-positioning.md`          | VyrnForge positioning as a native-first enterprise UI foundation.                |
| `benchmark/02-component-coverage-comparison.md`  | Component coverage matrix and gaps.                                              |
| `benchmark/03-data-grid-comparison.md`           | Data-grid benchmark against TanStack Table, AG Grid, MUI X, and related options. |
| `benchmark/04-theming-and-styling-comparison.md` | Theme and styling model comparison.                                              |
| `benchmark/05-state-and-adapter-comparison.md`   | State ownership and adapter comparison.                                          |
| `benchmark/06-roadmap-gap-analysis.md`           | Benchmark-informed roadmap gaps and priorities.                                  |

## 7. Quality

Q1 quality docs define the stabilization bar for current components. They do not replace the roadmap; they gate promotion to stable.

| Document                                       | Purpose                                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `quality/00-quality-gates.md`                  | Component quality gates, severity definitions, and status rules.                                                    |
| `quality/01-current-component-audit.md`        | Current component audit across packages, docs, metadata, playground routes, and tests.                              |
| `quality/02-remediation-plan.md`               | Prioritized Q1 hardening plan and non-goals.                                                                        |
| `quality/03-known-limitations.md`              | Remaining limitations, workarounds, and production-use recommendations.                                             |
| `quality/04-coverage-baseline.md`              | V8 coverage scope, initial per-package baseline, evidence boundaries, and threshold-ratcheting policy.              |
| `quality/05-formatting-baseline.md`            | Hash-pinned transition baseline that rejects new or modified formatting debt.                                       |
| `quality/q1-component-quality-audit.md`        | CI-004 public export inventory, component quality findings, maturity recommendations, and alpha remediation queues. |
| `quality/s3-semantic-token-audit.md`           | VF-3001 styling decision inventory, token gaps, migration debt, and S3 foundation outcome.                          |
| `quality/s3-token-adoption-report.md`          | VF-3009/VF-3010 package adoption evidence and documented exceptions.                                                |
| `quality/s3-visual-regression.md`              | VF-3011 theme/density visual matrix, computed-style baselines, and screenshot artifacts.                            |
| `quality/s3-g3-closure.md`                     | VF-3012 final evidence chain, accepted exceptions, and G3 closure rule.                                             |
| `quality/s4-multi-framework-architecture.md`   | MF-4001–MF-4008 architecture evidence and explicit GMF1 support-claim boundary.                                     |
| `testing/regression-fixtures.md`               | Deterministic fixture application for DOM, accessibility, browser, future visual, and consumer-oriented checks.     |
| `testing/multi-framework-consumer-fixtures.md` | React, native HTML, Angular, and Vue architecture fixtures and GMF4 evidence rules.                                 |
| `testing/browser-testing.md`                   | Playwright browser-test commands, fixture contracts, selector rules, artifacts, and evidence boundaries.            |

## 8. Release Governance

Release docs define the implemented alpha publication, versioning, deprecation, registry verification, release-record, and release-readiness process. They do not claim stable or production-ready support.

| Document                                      | Purpose                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `release/README.md`                           | Release documentation index.                                                                   |
| `release/release-policy.md`                   | Release maturity stages and expectations.                                                      |
| `release/versioning-policy.md`                | Package versioning and prerelease rules.                                                       |
| `release/publication-procedure.md`            | Controlled OIDC publication, registry verification, and release-record procedure.              |
| `release/deprecation-and-migration-policy.md` | Public API, CSS, behavior, and migration rules.                                                |
| `release/release-readiness-checklist.md`      | Reusable alpha, beta, and stable release checklist.                                            |
| `release/external-consumer-verification.md`   | Packed package consumer fixture and verification command.                                      |
| `release/release-responsibility-matrix.md`    | CI, package, deployment, npm publication, registry verification, and release-record ownership. |

## 9. Legal

VyrnForge UI is source-available under the VyrnForge Source License 1.0. The full license is the root `../LICENSE` file; documentation should link to it instead of duplicating the legal text.

| Document                        | Purpose                                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `../LICENSE`                    | Full VyrnForge Source License 1.0 legal text.                                                                         |
| `legal/commercial-licensing.md` | Informational overview for evaluation, production, commercial use, redistribution, and commercial-license boundaries. |

## 10. React Documentation App

The React docs app lives in `apps/docs`. It is a viewer/navigation layer over these markdown files, not a new source of truth.

```bash
npm run dev:docs
npm run build:docs
```

| Document                               | Purpose                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| `react-docs/00-react-docs-app-spec.md` | Specification for the human-facing docs/playground app. |
| `react-docs/01-route-map.md`           | Required route structure.                               |
| `react-docs/02-example-standards.md`   | Rules for examples, snippets, and use-case pages.       |
| `react-docs/03-ai-readable-docs.md`    | How docs should expose machine-readable context.        |

## 11. AI Documentation

| Document                             | Purpose                                 |
| ------------------------------------ | --------------------------------------- |
| `../.ai/AI_CONTEXT.md`               | Primary AI context file.                |
| `../.ai/REPO_MAP.md`                 | AI-readable repo structure guide.       |
| `../.ai/CODING_RULES.md`             | Implementation rules for agents.        |
| `../.ai/DOC_USAGE_GUIDE.md`          | How AI should read and update docs.     |
| `../AGENTS.md`                       | Root instruction file for Codex/agents. |
| `ai/00-ai-documentation-strategy.md` | Strategy for AI-readable project docs.  |

## 12. AI-Readable Metadata

Markdown docs are the human source of truth. Metadata files are structured indexes for AI agents and the React docs app. Update metadata whenever public components, APIs, CSS imports, state contracts, package boundaries, or AI usage rules change.

| Metadata                                  | Purpose                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `metadata/packages.json`                  | Package ownership, dependencies, CSS imports, and public entry points.                                                       |
| `metadata/multi-framework.json`           | Renderer support levels, beta release groups, planned package topology, and fixture policy.                                  |
| `metadata/component-contracts.json`       | Framework-neutral events, slots, form association, and representative component contracts.                                   |
| `metadata/component-contract.schema.json` | JSON Schema for the canonical multi-framework component contract catalog.                                                    |
| `metadata/components.json`                | Canonical normalized component and public-contract catalog, including maturity, ownership, routes, exports, and evidence.    |
| `metadata/design-tokens.json`             | Canonical semantic token categories, theme coverage, density aliases, motion, layers, and compatibility bridges.             |
| `metadata/visual-regression-matrix.json`  | Canonical VF-3011 visual suites, theme/density dimensions, targets, and token expectations.                                  |
| `metadata/g3-closure.json`                | Machine-readable VF-3012 task/evidence inventory and G3 closure state.                                                       |
| `metadata/component-schema.md`            | Canonical component metadata schema and contributor workflow.                                                                |
| `metadata/css-imports.json`               | CSS import order and styling ownership.                                                                                      |
| `metadata/state-contracts.json`           | State ownership and adapter policies.                                                                                        |
| `metadata/ai-usage-rules.json`            | AI-specific usage rules and dependency constraints.                                                                          |
| `../.ai/COMPONENT_MAP.json`               | Compact AI navigation and usage notes; it consumes the canonical component catalog rather than repeating component maturity. |

## 13. Templates

| Template                               | Purpose                       |
| -------------------------------------- | ----------------------------- |
| `templates/component-doc-template.md`  | Standard component docs.      |
| `templates/package-readme-template.md` | Standard package README.      |
| `templates/sprint-doc-template.md`     | Standard sprint plan.         |
| `templates/adr-template.md`            | Architecture decision record. |
| `templates/ai-task-card-template.md`   | AI implementation task card.  |

## 14. Prompts

| Prompt                                        | Purpose                                          |
| --------------------------------------------- | ------------------------------------------------ |
| `prompts/01-doc-cleanup-and-unification.md`   | Documentation cleanup workflow.                  |
| `prompts/02-react-docs-app-implementation.md` | React documentation app implementation workflow. |

## 15. Archive

Archived docs are historical only. They preserve useful context but do not guide new work.

| Archive                                      | Contents                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `archive/2026-07-legacy-planning-pack/`      | Previous root-numbered planning docs replaced by governance, architecture, roadmap, package, and AI docs. |
| `archive/2026-07-ui6-architecture-notes/`    | Previous UI-6 architecture notes replaced by the canonical architecture docs.                             |
| `archive/2026-07-documentation-system-pack/` | Copied documentation-system zip preserved as historical input.                                            |

## Source Of Truth Map

| Topic                            | Canonical document                                    |
| -------------------------------- | ----------------------------------------------------- |
| Project identity                 | `governance/01-project-source-of-truth.md`            |
| Package boundaries               | `architecture/01-package-boundaries.md`               |
| Multi-framework support          | `architecture/adr-004-multi-framework-web-support.md` |
| Component interoperability       | `architecture/09-component-contracts-and-events.md`   |
| State ownership and Redux policy | `architecture/02-state-and-adapter-ownership.md`      |
| Styling and theme rules          | `architecture/03-theming-and-styling.md`              |
| Public API usage                 | `api/README.md`                                       |
| Release governance               | `release/README.md`                                   |
| Code boundaries                  | `architecture/04-clean-code-boundaries.md`            |
| Roadmap                          | `roadmap/00-master-roadmap.md`                        |
| Component inventory              | `roadmap/01-component-inventory.md`                   |
| Benchmark positioning            | `benchmark/01-VyrnForge-positioning.md`               |
| AI context                       | `../.ai/AI_CONTEXT.md`                                |

## Multi-framework package foundations

| Document                                    | Purpose                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `api/ui-behaviors-api.md`                   | Framework-neutral S5 state, action, choice, numeric, Tabs, and event API. |
| `api/ui-elements-api.md`                    | Native Custom Element S4 foundation API and entry points.                 |
| `testing/gmf1-architecture-gate.md`         | GMF1 closure evidence and remaining release conditions.                   |
| `quality/s5-framework-neutral-behaviors.md` | S5 scope, invariants, non-scope, and GMF2 relationship.                   |
| `testing/behavior-foundation-contracts.md`  | MF-5001–MF-5004 package and repository evidence.                          |
| `testing/behavior-react-parity.md`          | MF-5005–MF-5007 React adapter parity evidence.                            |
