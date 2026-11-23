# Motion utility

Motion is the shared timing, easing, loading cadence, and reduced-motion foundation for VyrnForge. Canonical `@vyrnforge/web` CSS defines its effects across Native Web, React, Angular, Vue, and Elements. React additionally offers a typed functional `<Motion>` wrapper; it is not a second animation framework, a page transition manager, or a global JavaScript controller.

## What belongs in Motion

- Transitions: short, functional feedback when a control changes hover, focus, selection, or pressed state. Existing VyrnForge controls share one default duration and easing instead of each framework inventing a new timing system.
- Continuous loading: a different semantic task from ordinary control transitions. Shared spinner and shimmer cadences are already present in the Web foundation.
- Entry and exit: Dialog, Popover, Drawer, Tooltip, and other surfaces own their state, dismissal, focus, and rendering contracts. Motion must not delay, invent, or intercept those transitions.
- Reduced motion: an independent browser preference, never a brand/theme variant. Components remain usable when transitions or animations are suppressed.

## Existing reusable tokens

- `--vf-control-motion-duration` — default `120ms` for interactive control feedback; the foundation remaps it to `0ms` under `prefers-reduced-motion: reduce`.
- `--vf-motion-duration-enter` — default `320ms` for one-shot entrance effects, independent of control feedback.
- `--vf-motion-easing-standard` — default `cubic-bezier(0.2, 0, 0, 1)` for control transitions.
- `--vf-motion-duration-loading-spin` — default `700ms` for the shared spinner.
- `--vf-motion-duration-loading-shimmer` — default `1400ms` for a structured loading placeholder.
- `--vf-motion-easing-loading` — default `linear` for continuous loading.

These tokens are authored once in the Web token system and consumed by existing components. The public `@vyrnforge/web/styles/tokens.css` and `@vyrnforge/web/styles/foundation.css` entrypoints provide the shared values and preference behavior; component CSS handles any additional reduced-motion suppression it needs.

## Reusable entrance effects

Load the existing public foundation stylesheet `@vyrnforge/web/styles/foundation.css` (or aggregate `@vyrnforge/web/styles.css`). The effect recipes are privately factored into the shared Web foundation; there is no separate public `motion.css` package export. These are opt-in CSS recipes, not automatic animations on every component. Attach `data-vf-motion` to an element or to a wrapper around existing components:

- `fade` — opacity into place without spatial motion.
- `grow` — subtle scale from 94% to full size.
- `slide` — translate into place from a logical side.
- `zoom` — scale from 82% with a short fade.
- `fade-slide` — opacity and translation together.
- `pop` — a restrained, one-shot overshoot before settling.

```html
<link rel="stylesheet" href=".../@vyrnforge/web/styles/foundation.css">
<div data-vf-motion="fade">Content</div>
<div data-vf-motion="slide" data-vf-motion-direction="inline-start">
  <button type="button">Action</button>
</div>
<div data-vf-motion="zoom" style="--vf-motion-duration-enter: 420ms">
  <p>Contextual information</p>
</div>
```

These examples are illustrative HTML; application bundlers should import the public foundation stylesheet using the package entrypoint, not a literal placeholder URL. For Native Web, Angular, Vue, and Elements, the same data attributes remain available on native wrappers. React consumers can instead use the typed public component:

```tsx
import { Motion, Button } from '@vyrnforge/react';
import '@vyrnforge/web/styles/foundation.css';

<Motion effect="fade-slide" direction="inline-start" duration={420}>
  <Button>Continue</Button>
</Motion>
```

`Motion` is a React functional component with a native semantic wrapper (`as` defaults to `div`), normal React children and native attributes, forwarded ref, and typed `effect`, `direction`, and optional numeric `duration` (milliseconds). Omit `duration` to inherit the shared entrance duration token of 320ms. It does not automatically install CSS or control exit/presence. The semantic effect vocabulary remains shared across frameworks.

The optional `data-vf-motion-direction` applies to `slide` and `fade-slide`. Supported values are `block-start`, `block-end` (default), `inline-start`, and `inline-end`; inline directions automatically flip in RTL. Set `--vf-motion-distance` on the element or its parent to customize the slide distance (CSS length; default `--vf-space-sm`). Entrance uses the dedicated public `--vf-motion-duration-enter` and existing `--vf-motion-easing-standard` easing tokens, independent of control transitions, and stops completely under `prefers-reduced-motion: reduce` regardless of a consumer duration override.

Each recipe runs once when the element's animation starts. An application may replay it by inserting the element again; replaying by remounting a focusable element can itself move focus, so preserve semantics and focus deliberately. These recipes do not animate *exit*, wait for animation completion, set `display`, or control an element's accessibility/presence state. Do not attach them to a component that already owns an animation on the same element (for example, a busy spinner); wrap that component instead.

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

The live playground changes these values for public VyrnForge Button and Switch examples. The preview's custom settings demonstrate consumer overrides, not alternate VyrnForge defaults. A consumer override must never re-enable non-essential motion for someone requesting reduced motion. Specific components may also disable transitions or animations directly in their canonical CSS.

## Motion and interaction contracts

A transition describes how a *visual state* changes; it does not decide whether the state changes. Toggle selection, commit, validation, focus, dismissal, and accessibility announcements occur according to the component contract whether duration is `120ms`, `0ms`, or motion is unsupported. Never wait on `transitionend`, `animationend`, a timeout, or an animation timeline to commit a UI action.

Avoid animating layout or focus placement for cosmetic effect. Reserve motion for useful orientation or feedback, keep control transitions short, and respect forced-colors, zoom, RTL, and browser limitations. Do not invent opacity/visibility transitions that accidentally leave invisible focusable descendants or a modal surface active.

## Loading is not decoration

Button's busy spinner and Loading's structured spinner/shimmer already share foundation timing and keyframe recipes. Loading state is semantic: a visual animation never substitutes for a real busy state, status message, or application-owned progress. Under reduced motion, the visual movement stops but the indicator and the meaningful state remain available. Do not speed up or loop decorative motion just because the tokens exist.

## When a new recipe is justified

The small, opt-in entrance vocabulary above is reusable on real Button, Switch, and composition wrappers without adding component-specific motion engines. Treat any further effect, complex spring-like movement, and especially component exit/enter lifecycle orchestration as a separate decision once multiple actual component consumers need the same observable behavior. Document supported browser capabilities, direction/writing-mode policy, lifecycle and focus invariants, reduced-motion fallback, styling hooks, and cross-framework expectations before exposing a stable utility. Prefer native CSS; do not add Framer Motion, a global animation controller, or a JavaScript timing dependency for component styling.

This utility covers the shared motion system. Button, Switch, Loading, Dialog, Drawer, and other components retain their own state, anatomy, and accessibility contracts.
