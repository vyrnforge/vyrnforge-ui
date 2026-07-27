# `@vyrnforge/ui-elements` - Native Foundation In Progress

## Purpose

Browser-native Custom Element renderer for public non-grid VyrnForge
components and plain HTML consumption.

## Implemented foundation

EL-6001 and EL-6002 add the first S6 runtime foundation:

- idempotent `vf-*` definition and register-all helpers;
- a reusable registration factory for future per-element entry points;
- an immutable definition catalog;
- server-safe Light DOM base class;
- inherited property declarations;
- deterministic observed-attribute derivation;
- Boolean, finite-number, and string parsing;
- opt-in primitive property reflection;
- property-only object and array state;
- pre-definition property upgrade;
- batched updates, changed-property records, reconnect deferral, and
  `updateComplete`.

## Still pending

- typed event expansion under EL-6003;
- form-associated base utilities under EL-6004;
- public component tags under EL-6005 through EL-6017;
- complete native API, browser, accessibility, theme, density, and package
  parity under EL-6018 / GMF3.

The current foundation does not claim GMF3 or GMF4 completion.
