# `@vyrnforge/ui-behaviors` — S5 Foundations Current

## Purpose

Framework-neutral behavior boundary for public non-grid components. The
package owns portable state transitions and controller events while renderer
lifecycle, DOM execution, application state, and backend workflows remain
outside it.

## Boundary

The package may depend on `@vyrnforge/ui-core` only and is compiled with an
ES-only TypeScript library. Repository verification rejects renderer imports
and DOM identifiers.

## Current scope

### MF-5001 — Controllable state

- explicit controlled-mode detection by property presence;
- uncontrolled committed state;
- controlled change proposals;
- external value synchronization;
- reset, updater, equality, snapshot, command, and event contracts.

### MF-5002 — Collection and active item

- keyed item registration and updates;
- deterministic order and stable registration sequence;
- enabled-key projection;
- first, last, next, and previous navigation;
- disabled-item skipping, optional looping, and active-item reconciliation.

### MF-5003 — Selection

- single and multiple selection;
- select, deselect, toggle, range, replace, clear, and synchronization;
- range anchors and ordered-key providers;
- disabled-key filtering;
- controlled and uncontrolled selection contracts.

### MF-5004 — Controller events

- canonical reason vocabulary;
- immutable behavior-event records;
- event and snapshot subscription channels;
- reasoned collection, active-item, value, and selection events.

## Still deferred within S5

Component-specific migration begins with MF-5005. No React component uses these
controllers merely because the foundations exist. React API and browser parity
must remain explicit evidence for each migration batch.

## Validation

```bash
npm run test:coverage --workspace @vyrnforge/ui-behaviors
npm run verify:behavior-foundations
npm run verify:package-boundaries
```
