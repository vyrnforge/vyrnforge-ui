# `@vyrnforge/ui-elements` - Native Foundation In Progress

## Purpose

Browser-native Custom Element renderer for public non-grid VyrnForge
components and plain HTML consumption.

## Implemented foundation

EL-6001 through EL-6004 provide:

- idempotent `vf-*` definition, per-element, and register-all helpers;
- a server-safe Light DOM reactive base class;
- inherited property declarations, observed attributes, reflection, and update
  batching;
- canonical bubbling and composed `vf-*` CustomEvent utilities;
- typed event-dispatcher factories with stable detail contracts;
- an ElementInternals-backed form-associated base;
- form value and state forwarding;
- effective disabled state from properties and form callbacks;
- validity, custom validity, reset, and restoration utilities;
- unsupported-browser fallbacks that preserve the public contract;
- real Chromium form submission, disabled, reset, and validity evidence.

## Still pending

- public component tags under EL-6005 through EL-6017;
- complete native API, browser, accessibility, theme, density, and package
  parity under EL-6018 / GMF3.

The current foundation does not claim native component parity or GMF3
completion.
