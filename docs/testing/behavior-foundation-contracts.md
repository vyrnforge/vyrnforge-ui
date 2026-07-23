# Behavior Foundation Contract Evidence

The MF-5001 through MF-5004 batch is verified at three levels.

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
- command dispatch for every controller;
- public entry-point exports.

## Repository contract

```bash
npm run test:behavior-foundations
npm run verify:behavior-foundations
```

The repository verifier checks task evidence, required source files, public
exports, documentation, metadata, canonical reasons, and integration into the
authoritative quality commands.

## Boundary evidence

```bash
npm run verify:package-boundaries
```

The existing boundary verifier rejects framework imports and DOM identifiers in
production behavior source.
