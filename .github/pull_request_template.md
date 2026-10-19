## Purpose

What reusable VyrnForge problem does this change solve, and which canonical contract/architecture governs it?

## Affected product nodes

- [ ] Core
- [ ] Web / CSS / tokens
- [ ] React
- [ ] Angular
- [ ] Vue
- [ ] Elements
- [ ] Documentation
- [ ] Testing / CI / tooling
- [ ] Legacy quarantine only

## Contract and architecture

- [ ] I reviewed the smallest relevant canonical VyrnForge documentation.
- [ ] Shared semantics remain framework-neutral where practical.
- [ ] I reused an approved foundation or documented why a new abstraction is required.
- [ ] I did not introduce a sibling-port dependency, universal component runtime, framework-local visual system, or application business architecture.
- [ ] Public API/styling/DOM/accessibility changes are intentional and documented where applicable.

## Validation

CI derives required evidence from the product and validation dependency graphs. Do not replace scoped evidence with an arbitrary full-suite run.

- [ ] The PR validation-plan artifact matches the intended impact.
- [ ] Relevant contract, port, browser, accessibility, forms, package/consumer, SSR, visual, and documentation evidence was added or updated where applicable.
- [ ] Expensive evidence that does not apply remains skipped rather than being added as a blanket requirement.
- [ ] Unknown or foundational impact is allowed to fail closed and broaden validation.

## Documentation

- [ ] Shared framework-neutral documentation was reused instead of copied into framework guides.
- [ ] Framework-specific documentation contains only framework-specific integration/API/examples.
- [ ] Unimplemented framework surfaces are not presented as supported.

## Notes

List intentional deferrals, compatibility decisions, reviewer context, or follow-up work. `packages/legacy` is historical evidence only and must not become a dependency or source of truth.
