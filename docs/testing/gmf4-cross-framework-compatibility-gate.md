# GMF4 Cross-Framework Compatibility Gate

## Decision

GMF4 is **evidence-complete**. CF-7001 through CF-7014 are complete, S7 is
closed at 84/84 story points, and no unresolved blocker remains for the
VyrnForge non-grid multi-framework beta support claim.

This gate closes compatibility evidence. It does not publish packages or expand
the release group.

## Supported web consumers

| Consumer    | Support level     | Renderer                                                           | Evidence                                                                                 |
| ----------- | ----------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| React       | First-class       | `@vyrnforge/ui-components` and verified Custom Element consumption | Packed build, shared browser matrix, accessibility matrix                                |
| Native HTML | First-class       | `@vyrnforge/ui-elements`                                           | Packed build, native forms, shared browser matrix, accessibility matrix                  |
| Angular     | Verified consumer | `@vyrnforge/ui-elements`                                           | Angular 22 packed build, property/event/slot/form checks, Angular Forms adapter          |
| Vue         | Verified consumer | `@vyrnforge/ui-elements`                                           | Vue 3 packed build, strict type checks, property/event/slot/form checks, v-model adapter |

Angular and Vue consume the shared native renderer; they are not separate
VyrnForge component implementations.

## Package boundary decision

The non-grid beta release group contains:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`
- `@vyrnforge/ui-components`
- `@vyrnforge/ui-elements`

Published runtime surfaces must not acquire Angular, Vue, Pinia, NgRx, Redux,
Zustand, or application-specific state-management dependencies. React remains a
valid peer/runtime boundary for the React renderer package.

`@vyrnforge/ui-data-grid` remains React alpha and is explicitly deferred from
this non-grid beta gate.

## Compatibility evidence

GMF4 consolidates:

1. Clean packed Native HTML, React, Angular, and Vue consumer builds.
2. Shared property, event, slot, action, tabs, input, and native-form browser scenarios.
3. Angular Forms and Vue model adapter reference integrations.
4. SSR-safe imports and bundler compatibility checks.
5. Generated Custom Elements declarations, framework usage tabs, and component contracts.
6. Automated Axe checks with no serious or critical violations.
7. Keyboard and focus behavior across all four consumers.
8. Named Windows, Chrome, and NVDA manual review evidence.
9. Reviewed migration, framework-selection, exclusions, and limitations guidance.
10. Package-boundary, inventory, formatting, coverage, browser, packed-package, and documentation builds.

## Accepted limitations

- React and native HTML are first-class renderers; Angular and Vue are verified consumers.
- Angular Forms and Vue v-model bridges are reference adapters, not new published libraries.
- The data grid remains outside the non-grid beta critical path.
- React Native, Flutter, native Android/iOS, and desktop-native platforms are excluded.
- A passing local closure does not replace the protected `ci-gate`.

## Blocking rules

The gate fails when:

- CF-7001 through CF-7014 are not all done.
- A prerequisite verifier reports an unresolved contract or evidence failure.
- A supported consumer is removed or promoted beyond its verified support level.
- Angular, Vue, or an application state manager leaks into a published runtime dependency surface.
- The data grid is silently added to the non-grid beta release group.
- Required automated or named manual evidence is missing.
- `unresolvedBlockers` is not empty.
- The gate is absent from `verify:metadata`, `verify:ci`, or `quality`.

## Commands

```bash
npm run test:gmf4-closure
npm run verify:gmf4-closure
npm run verify:ci
npm run verify:metadata
npm run quality
```

Runtime and manual details remain owned by their canonical CF-7009, CF-7010,
and CF-7013 records. This closure links those sources instead of duplicating
their observations.

## Outcome

- Gate: GMF4
- Sprint: S7
- Completion: 84/84 story points
- Status: evidence-complete
- Unresolved blockers: none
- Next sprint: S8
- Next task: BT-8001 — non-grid beta readiness
