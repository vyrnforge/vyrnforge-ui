# Pattern product units

Patterns are a distinct product responsibility from reusable UI components. They compose foundations, components, behavior contracts, and authored semantics into reusable UX/task guidance without creating a new component tier or runtime.

A Pattern may own documentation, executable examples, evidence, and narrowly justified reusable presentation artifacts when those artifacts belong to the pattern rather than to one atomic component.

The retained Pattern product units are `loading`, `settings-navigation`, `button-group`, `checkbox-group`, and `radio-group`. Button Group is a guide-only composition pattern using existing Button and Flow presentation; it has no public API or stylesheet of its own. Loading is owned by `product/patterns/loading/` and retains its existing public `@vyrnforge/web/styles/loading.css` entrypoint and an explicit React presentation adapter at `@vyrnforge/react/loading`. The adapter does not change Loading's Pattern ownership or introduce an async runtime. Settings navigation is owned by `product/patterns/settings-navigation/` as guidance only; its authored guide is not an additional public runtime API.

Checkbox Group and Radio Group are guide-only native selection composition patterns. Neither adds a public API, stylesheet or selection runtime.

Pattern ownership follows the approved responsibility-based product architecture. Do not copy Loading's Web surface to every future pattern automatically; task guidance may be documentation-only when no reusable runtime is justified.
