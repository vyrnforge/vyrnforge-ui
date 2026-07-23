# S5 Framework-Neutral Behaviors

## Objective

Extract reusable non-grid state and interaction decisions into
`@vyrnforge/ui-behaviors` while preserving the public React API and browser
behavior.

## Foundation batch

MF-5001 through MF-5004 establish the primitives needed by later component
controllers:

| Task    | Contract                                          | Status      |
| ------- | ------------------------------------------------- | ----------- |
| MF-5001 | controlled and uncontrolled state                 | implemented |
| MF-5002 | collection ordering and active-item navigation    | implemented |
| MF-5003 | single, multiple, toggle, and range selection     | implemented |
| MF-5004 | canonical controller events and reason vocabulary | implemented |

## Required invariants

- no React, Vue, Angular, DOM, browser-global, or renderer dependency;
- snapshots are immutable records;
- snapshot subscriptions represent committed state;
- controlled operations emit proposals without taking ownership;
- external synchronization does not invoke the consumer change callback;
- disabled collection and selection items cannot become active or selected;
- collection ordering is deterministic;
- range selection has an explicit ordered-key source;
- every change event includes a stable type, detail payload, and reason.

## Non-scope

- React component migration;
- native Custom Element rendering;
- DOM focus execution;
- overlay positioning;
- data-grid behavior;
- application business state or persistence.

## Gate relationship

This batch does not complete GMF2. GMF2 requires component migrations and React
parity through MF-5016.
