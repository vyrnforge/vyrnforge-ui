# `@vyrnforge/ui-behaviors` — Foundation Current

## Purpose

Framework-neutral behavior boundary for public non-grid components. The S4
foundation now exists and exposes controller, subscription, transition-reason,
and behavior-event contracts.

## Boundary

The package may depend on `@vyrnforge/ui-core` only and is compiled with an
ES-only TypeScript library. Repository verification rejects renderer imports
and DOM identifiers.

## Current scope

- behavior event and transition reason types;
- controller, listener, and unsubscribe contracts;
- immutable `createBehaviorEvent` helper;
- build, declarations, tests, coverage, packaging, and consumer verification.

Component-specific state, collection, selection, form, navigation, and overlay
controllers remain S5 work under GMF2.
