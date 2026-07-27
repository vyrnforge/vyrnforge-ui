# Behavior Foundation Contract Evidence

MF-5001 through MF-5016 are verified at four levels.

## Package tests

`@vyrnforge/ui-behaviors` unit and coverage tests exercise:

- controlled and uncontrolled state requests and synchronization;
- equality and reset behavior;
- stable snapshot and event subscriptions;
- deterministic collection ordering;
- disabled-item navigation, looping, clamping, mutation, and reconciliation;
- single and multiple selection;
- toggle, range, replacement, clearing, anchors, disabled filtering, and
  controlled synchronization;
- action, toggle, choice, numeric, and Tabs controllers;
- Autocomplete filtering, active-option movement, selection, clearing, and
  controlled value/input/open proposals;
- MultiSelect filtering, active-option movement, disabled rejection, clear,
  and controlled selection proposals;
- Transfer List partitioning, panel filtering, visible selection, selected/all
  moves, disabled-item exclusion, and controlled target-value proposals;
- Menu and SideNav roving active intent, disabled-item skipping, Home/End
  movement, selection events, and dismissal reasons;
- controlled and uncontrolled overlay lifecycle, explicit dismissal reasons,
  layer ordering, positioning, flipping, and viewport shifting;
- Dialog, Drawer, Popover, and Tooltip component-kind configuration and
  trigger/content relationships;
- Toast queue, visible-window, duration, pause/resume, action, and dismissal
  transitions;
- ConfirmDialog loading/disabled action eligibility and controlled proposals;
- command dispatch and public entry-point exports.

## Repository contract

```bash
npm run test:behavior-foundations
npm run verify:behavior-foundations
```

The repository verifier checks task evidence, required source files, public
exports, React adoption markers, documentation, metadata, canonical reasons,
and integration into the authoritative quality commands.

## Boundary evidence

```bash
npm run verify:package-boundaries
```

The boundary verifier rejects framework imports and DOM identifiers in
production behavior source. React retains ownership of portals, refs, focus,
native inputs, and event translation.

## React adoption and GMF2 closure

```bash
npm run test:react-behavior-adoption
npm run verify:react-behavior-adoption
npm run test:gmf2-closure
npm run verify:gmf2-closure
```

The adoption verifier classifies every public React component and checks required shared behavior markers. The GMF2 closure verifier composes behavior, package-boundary, React adoption, metadata, and evidence checks.
