# Typeahead Matching

Canonical Layer 4 Core capability for matching an already-accumulated typeahead query against an ordered collection.

## Owns

- item text values
- item eligibility for matching
- normalized prefix matching
- start position
- optional wrapping
- locale-aware lowercasing

## Does not own

- keyboard/event handling
- query accumulation or reset timers
- IME/composition lifecycle
- filtering
- selection
- focus movement or DOM effects

Components translate their own semantics into `eligible` before calling the capability.
