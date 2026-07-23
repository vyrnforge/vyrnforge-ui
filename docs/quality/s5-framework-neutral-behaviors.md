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
| MF-5005 | simple action and toggle behaviors                | implemented |
| MF-5006 | simple form-control behaviors                     | implemented |
| MF-5007 | Tabs and composite navigation behavior            | implemented |

## First React adoption batch

MF-5005 through MF-5007 migrate representative action, toggle, native form,
choice, numeric, and composite navigation components onto the shared behavior
package without changing their public React APIs. React still owns DOM focus,
native element rendering, refs, and event translation.

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

- React migration beyond MF-5005 through MF-5007;
- native Custom Element rendering;
- DOM focus execution;
- overlay positioning;
- data-grid behavior;
- application business state or persistence.

## Gate relationship

MF-5001 through MF-5007 do not complete GMF2. Autocomplete, MultiSelect,
Transfer List, Menu, SideNav, overlays, Toast, ConfirmDialog, final React
migration audit, and the closing parity gate remain scheduled through MF-5016.
