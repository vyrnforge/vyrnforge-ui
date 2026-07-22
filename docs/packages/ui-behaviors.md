# `@vyrnforge/ui-behaviors` — Planned

## Purpose

`@vyrnforge/ui-behaviors` is the approved framework-neutral behavior boundary
for public non-grid components. The package does not exist yet; implementation
begins in S5 after GMF1.

## Planned ownership

- controlled and uncontrolled state transitions;
- collection registration and ordering;
- active-item and keyboard decision models;
- single and multiple selection models;
- validation state;
- canonical controller events and transition reasons.

## Boundary

The package may depend on `@vyrnforge/ui-core` only. It must not import React,
React DOM, Vue, Angular, `HTMLElement`, `document`, or `window` execution.

DOM focus, positioning, observers, and rendering remain renderer or DOM-adapter
concerns.

## Release direction

The package is included in the planned coordinated non-grid beta release group.
It cannot be published until its public API, package payload, tests, and React
parity are approved under GMF2.
