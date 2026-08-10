# `@vyrnforge/ui-behaviors`

## Purpose

`@vyrnforge/ui-behaviors` owns framework-neutral component state transitions
and interaction decisions shared by VyrnForge renderers.

The package covers controller contracts for:

- controlled and uncontrolled state;
- collections and active-item navigation;
- selection and choice models;
- toggles and numeric values;
- tabs and navigation;
- autocomplete, multi-select, and transfer-list behavior;
- overlays and positioning decisions;
- dialog, drawer, popover, and tooltip lifecycle;
- toast and confirmation behavior;
- reasoned controller events and subscriptions.

## Install

```bash
npm install @vyrnforge/ui-behaviors@beta
```

## Boundary

`ui-behaviors` may depend on `@vyrnforge/ui-core` only.

It must not own:

- React hooks, JSX, refs, or synthetic events;
- Angular or Vue runtime objects;
- DOM nodes or browser-global execution;
- focus execution, observers, portals, or CSS;
- application persistence, backend requests, authorization, or workflows.

Renderers translate their framework conventions into these controllers and
translate controller results into framework callbacks or canonical `vf-*`
events.

## API

Use [ui-behaviors API](../api/ui-behaviors-api.md) for exported controller
contracts. State ownership rules are canonical in
[State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md).

## Release channel

`@vyrnforge/ui-behaviors` is part of the synchronized non-grid `beta` release
group.
