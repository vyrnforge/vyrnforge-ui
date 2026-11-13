---
'@vyrnforge/core': major
'@vyrnforge/web': major
'@vyrnforge/react': major
'@vyrnforge/angular': major
'@vyrnforge/vue': major
'@vyrnforge/elements': major
---

Reduce Layer 4 Behavioral Infrastructure to responsibility-owned shared behavior.

Breaking changes:

- Keep `@vyrnforge/core/collection-navigation` as the shared ordered-collection navigation capability.
- Keep `@vyrnforge/core/typeahead-matching` as the shared typeahead match calculation.
- Remove `@vyrnforge/core/selection-operations`. Selection meaning and transitions remain owned by the components that define them.
- Remove `@vyrnforge/core/composite-focus` and `@vyrnforge/web/composite-focus`. Collection movement reuses CollectionNavigation; roving tabindex, active-descendant state, DOM focus and ARIA execution remain component/port-local.
- Remove public Portal entrypoints from React, Angular, Vue and Elements. Rendering-host mechanics remain framework/renderer implementation details.
- Remove public Presence entrypoints from React, Angular, Vue and Elements. Exit retention and mount/unmount lifecycle remain component/framework implementation details.
- Remove the component-shaped `product/components/behavioral-infrastructure` ownership tree.

`@vyrnforge/web/floating-positioning` and `@vyrnforge/web/dismissal-coordination` are not accepted as Layer 4 responsibilities by this change. They remain existing Web capabilities pending a separate browser/overlay responsibility audit; this change does not promote them into a universal overlay runtime.

No universal focus manager, overlay manager, state machine, lifecycle runtime, selection controller, application store or framework-neutral rendering layer is introduced.
