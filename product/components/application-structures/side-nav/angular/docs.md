# Angular SideNav current-link semantics

Use the public `@vyrnforge/angular/side-nav` directives on native anchors and load the canonical SideNav stylesheet from `@vyrnforge/web`. The application supplies the destination and decides which destination is current; the directive does not infer routes or cancel native navigation.

## Authored state and convenience precedence

Static `aria-current="step"` remains supported. For a changing authored value on an anchor with `vfSideNavLink`, use the direct Angular input alias `[aria-current]="authoredCurrent"`. Its accepted type is `string | null | undefined`. The existing `[vfSideNavCurrent]="isCurrent"` input remains a boolean.

When the convenience is true, the actual anchor exposes `aria-current="page"`. When it is false or omitted, the actual anchor exposes the latest authored value. Changing the authored value while the convenience is true updates the fallback without changing the effective page value. Returning to false restores that latest value; null or undefined removes the attribute when not overridden. The string `"false"` is retained as an authored ARIA token, not converted to absence. Only the effective page state receives page-current presentation.

## Binding migration

On an anchor carrying `vfSideNavLink`, replace `[attr.aria-current]="authoredCurrent"` with `[aria-current]="authoredCurrent"`. The explicit `attr.` syntax bypasses directive input handling and is not a supported second writer of the same attribute. Do not combine it with the directive's current-state management. Static `aria-current`, boolean `vfSideNavCurrent`, href, other native attributes and the public package entrypoint remain unchanged.

Example: `<a vfSideNavLink [aria-current]="authoredCurrent" [vfSideNavCurrent]="isCurrent" href="/settings">Settings</a>`. Supply string ARIA values (including `"false"`) or null/undefined, not a boolean in the authored-value input.

If the application wants to own the native attribute directly, omit `vfSideNavLink` and use the existing Web hook: `<a data-vf-side-nav-link [attr.aria-current]="effectiveCurrent" href="/settings">Settings</a>`. The application computes the effective value in this form; the convenience directive is not involved.

## Native composition

Keep actual anchors and href values so keyboard activation, modifier clicks and native new-tab actions remain browser-owned. For group labels, use the heading level appropriate to the authored document outline with `vfSideNavGroupLabel` (or the existing Web group-label hook); no new heading-level API is required.
