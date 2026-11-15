# Capabilities

`product/capabilities/` owns reusable non-component behavior or algorithms with an independently justified cross-product responsibility.

A capability is not a generic utilities bucket and is not a place to centralize framework lifecycle, DOM execution, browser-owned behavior, component policy, application state, or implementation code merely because multiple consumers currently duplicate it.

Current Layer 4 capability owners:

- `collection-navigation/` — ordered one-dimensional navigation calculations.
- `typeahead-matching/` — ordered collection typeahead matching.

Public package projection remains separate from product ownership. These capabilities currently project to stable `@vyrnforge/core/*` subpaths.
