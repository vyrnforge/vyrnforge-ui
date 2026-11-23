# Motion utility

Motion is the shared timing, easing, loading cadence, and reduced-motion foundation for VyrnForge. It is **not** a generic `Motion` component, a second animation framework, a page transition manager, or a global JavaScript controller. Use canonical `@vyrnforge/web` CSS tokens and the behavior already owned by each component, across Native Web, React, Angular, Vue, and Elements.

## What belongs in Motion

- **Transitions:** short, functional feedback when a control changes hover, focus, selection, or pressed state. Existing VyrnForge controls share one default duration and easing instead of each framework inventing a new timing system.
- **Continuous loading:** a different semantic task from ordinary control transitions. Shared spinner and shimmer cadences are already present in the Web foundation.
- **Entry and exit:** Dialog, Popover, Drawer, Tooltip, and other surfaces own their state, dismissal, focus, and rendering contracts. Motion must not delay, invent, or intercept those transitions.
- **Reduced motion:** an independent browser preference, never a brand/theme variant. Components remain usable when transitions or animations are suppressed.

## Existing reusable tokens

- `--vf-control-motion-duration` — default `120ms`; the foundation remaps it to `0ms` under `prefers-reduced-motion: reduce`.
- `--vf-motion-easing-standard` — default `cubic-bezier(0.2, 0, 0, 1)` for control transitions.
- `--vf-motion-duration-loading-spin` — default `700ms` for the shared spinner.
- `--vf-motion-duration-loading-shimmer` — default `1400ms` for a structured loading placeholder.
- `--vf-motion-easing-loading` — default `linear` for continuous loading.

These tokens are authored once in the Web token system and consumed by existing components. The public `@vyrnforge/web/styles/tokens.css` and `@vyrnforge/web/styles/foundation.css` entrypoints provide the shared values and preference behavior; component CSS handles any additional reduced-motion suppression it needs.

## Consume and customize

Use the default tokens first. Where a real application experience needs it, scope a semantic CSS variable to a region and allow its child components to inherit the override. This changes one shared timing value instead of rewriting Button, Switch, Input, or other component selectors.

```css
/* Application CSS: optional scoped customization, not a new library API. */
.my-workbench {
  --vf-control-motion-duration: 80ms;
  --vf-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
}

@media (prefers-reduced-motion: reduce) {
  .my-workbench {
    --vf-control-motion-duration: 0ms;
  }
}
```

The live playground changes these values for public VyrnForge Button and Switch examples. The preview's custom settings demonstrate consumer overrides, **not** alternate VyrnForge defaults. A consumer override must never re-enable non-essential motion for someone requesting reduced motion. Specific components may also disable transitions or animations directly in their canonical CSS.

## Motion and interaction contracts

A transition describes how a *visual state* changes; it does not decide whether the state changes. Toggle selection, commit, validation, focus, dismissal, and accessibility announcements occur according to the component contract whether duration is `120ms`, `0ms`, or motion is unsupported. Never wait on `transitionend`, `animationend`, a timeout, or an animation timeline to commit a UI action.

Avoid animating layout or focus placement for cosmetic effect. Reserve motion for useful orientation or feedback, keep control transitions short, and respect forced-colors, zoom, RTL, and browser limitations. Do not invent opacity/visibility transitions that accidentally leave invisible focusable descendants or a modal surface active.

## Loading is not decoration

Button's busy spinner and Loading's structured spinner/shimmer already share foundation timing and keyframe recipes. Loading state is semantic: a visual animation never substitutes for a real busy state, status message, or application-owned progress. Under reduced motion, the visual movement stops but the indicator and the meaningful state remain available. Do not speed up or loop decorative motion just because the tokens exist.

## When a new recipe is justified

Introduce a reusable fade, slide, scale, spring-like effect, or entry/exit recipe only after **multiple actual component consumers** need the same observable behavior. Document supported browser capabilities, direction/writing-mode policy, lifecycle and focus invariants, reduced-motion fallback, styling hooks, and cross-framework expectations before exposing a stable utility. Prefer native CSS; do not add Framer Motion, a global animation controller, or a JavaScript timing dependency for component styling.

This utility covers the shared motion system. Button, Switch, Loading, Dialog, Drawer, and other components retain their own state, anatomy, and accessibility contracts.
