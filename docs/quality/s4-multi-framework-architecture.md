# S4 Multi-Framework Architecture Evidence

## Scope

This record covers MF-4001 through MF-4008. It establishes the architecture
required before framework-neutral behavior extraction and native component
implementation.

## Implemented decisions

| Task    | Evidence                                                                        | Result                                                      |
| ------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| MF-4001 | `architecture/adr-004-multi-framework-web-support.md`                           | React/native-first web scope accepted; grid deferred        |
| MF-4002 | `architecture/01-package-boundaries.md`, `metadata/packages.json`               | Five-package target topology reserved                       |
| MF-4003 | `metadata/component-contract.schema.json`, `metadata/component-contracts.json`  | Machine-readable contract schema and representative records |
| MF-4004 | `metadata/component-contracts.json`                                             | Canonical bubbling/composed `vf-*` event vocabulary         |
| MF-4005 | `architecture/09-component-contracts-and-events.md`                             | Semantic composition and slot vocabulary                    |
| MF-4006 | `architecture/10-custom-elements-and-form-association.md`                       | Light DOM default and Shadow DOM exception policy           |
| MF-4007 | `architecture/10-custom-elements-and-form-association.md`                       | ElementInternals form-association contract                  |
| MF-4008 | `tests/consumers/manifest.json`, `testing/multi-framework-consumer-fixtures.md` | React, native HTML, Angular, and Vue architecture fixtures  |

## Automated contracts

```bash
npm run test:multi-framework
npm run verify:multi-framework
npm run test:package-boundaries
npm run verify:package-boundaries
npm run test:ci-scope
```

The multi-framework verifier rejects:

- promoting the data grid into the non-grid beta group;
- unapproved package dependencies;
- non-namespaced, non-bubbling, or non-composed public events;
- incomplete slot or form-association contracts;
- missing representative contracts;
- missing or overstated consumer fixtures;
- drift between package metadata and the approved topology.

## Evidence boundary

The S4 consumer fixtures are architecture-only. They do not prove that planned
packages compile or that Angular/Vue/native HTML are supported at runtime.
Runtime clean-install, build, type, browser, form, and accessibility evidence
is deferred to GMF4.

## Gate status

MF-4001 through MF-4008 provide the architecture batch. GMF1 is not marked
passed by this document alone. The remaining S4 gate-review tasks must confirm
that package, metadata, fixture, and implementation sequencing decisions have
no unresolved blocker.
