## Purpose

What reusable VyrnForge problem does this change solve, and which canonical contract/architecture governs it?

## Component delivery (only when this PR changes a component)

- **Mode:** NEW / MIGRATE / scoped port or existing-component change / not applicable
- **Component and outcome:** <!-- Product unit ID and user/consumer purpose -->
- **Decision:** implement new / use existing-native or pattern / retain / refactor / replace / remove / defer
- **Canonical contract / source revision:** <!-- Link to authoritative document and inspected SHA -->
- **Supported surfaces and deliberate non-support:** <!-- Identify actual implemented ports, not intended future ports -->
- **Migration or compatibility:** <!-- Old → new public API / migration guide / not applicable -->
- **Evidence and environment:** <!-- Exact current head SHA, CI validation-plan link, real-port browser/consumer tests, relevant SSR/package evidence, deferrals -->
- **Visual acceptance (when visible styling/art changes):** <!-- Actual-size before/after light/dark etc.; approved by reviewer/requester or pending. Green CI does not imply signoff. -->
- [ ] The NEW/MIGRATE delivery gates in [the repo skill](https://github.com/vyrnforge/vyrnforge-ui/blob/main/.agents/skills/vyrnforge-component-delivery/SKILL.md) are satisfied or exceptions are explicitly documented.

## Affected product nodes

- [ ] Core
- [ ] Web / CSS / tokens
- [ ] Icons
- [ ] React
- [ ] Angular
- [ ] Vue
- [ ] Elements
- [ ] Documentation
- [ ] Testing / CI / tooling

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

List intentional deferrals, compatibility decisions, reviewer context, or follow-up work. Retired implementations in Git history are provenance only and must not become dependencies or architectural sources of truth.
