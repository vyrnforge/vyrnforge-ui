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

Shared entrance effects use the canonical Web foundation. Their names and visual behavior remain consistent across supported framework ports. React consumes these effects through a typed `Motion` component; Native Web uses explicit data attributes. Neither introduces a second animation engine.

- `fade` — opacity into place without spatial motion.
- `grow` — subtle scale from 94% to full size.
- `slide` — translate into place from a logical side.
- `zoom` — scale from 82% with a short fade.
- `fade-slide` — opacity and translation together.
- `pop` — a restrained, one-shot overshoot before settling.

The optional logical entrance direction applies to `slide` and `fade-slide`: `block-start`, `block-end` (default), `inline-start` or `inline-end`. Inline directions adapt to RTL. Entrance effects use `--vf-motion-duration-enter` (default `320ms`), separate from 120ms control feedback, and stop for reduced-motion preference regardless of consumer timing overrides.

Each effect runs once on entrance. Presence, exit, dismissal and focus restoration remain component/application responsibilities. Replaying by remounting a focusable child may disturb focus; do not await animation events to commit UI state.

## Automatic component motion

The existing public components apply entrance motion to their committed visible state, without requiring consumer wrappers. Dialog and AlertDialog use a restrained reveal; Drawer slides from its logical edge. Popover, Tooltip, PreviewCard, Menu, ContextMenu, Menubar and SplitButton (through Menu), Select, Combobox and MultiSelect reveal their opened surfaces. Accordion, Disclosure, Tabs and Carousel reveal their visible panel or slide; Toast reveals an actual notification. The reveal starts partially opaque rather than invisible and does not alter layout. Control feedback also uses shared timing for Listbox and selection options, ToggleGroup, SegmentedControl, Rating, Pagination, Menubar, Toolbar and accordion triggers.

Control feedback stays at `--vf-control-motion-duration`; automatic entrances consume `--vf-motion-duration-enter` and `--vf-motion-easing-standard`. The React ThemeScope motion options configure those existing token roles locally. Setting entranceDuration to 0ms disables visible entrance movement; reduced-motion and forced-colors preferences suppress automatic nonessential animation regardless of overrides.

The public React Motion wrapper also accepts an active boolean. Setting it false removes the effect without unmounting, hiding, or disabling children; a later true value can replay the entrance. Ordinary component usage requires no Motion wrapper. Native platform close, hidden state, focus and selection are immediate: no exit retention, delayed close, or animation-dependent state commitment is introduced. Direct manipulation such as dragging a range slider or split panel must remain immediate. Static text, layout, media and decorative primitives do not animate by default; compose Motion only when an actual experience benefits.

## Native Web usage

For native markup, import `@vyrnforge/web/styles/foundation.css` (or aggregate `@vyrnforge/web/styles.css`) and select an opt-in effect with its public data attributes:

```html
<div data-vf-motion="fade">Content</div>
<div data-vf-motion="slide" data-vf-motion-direction="inline-start">
  <button type="button">Action</button>
</div>
<div data-vf-motion="zoom" style="--vf-motion-duration-enter: 420ms">
  <p>Contextual information</p>
</div>
```

Native Web attributes are low-level styling hooks; framework-specific consumer guides should show the active framework's public API. Avoid attaching a recipe to a component that already owns animation on that same element: use a wrapper instead.

## Consume and customize

Use the default tokens first. Where a real application experience needs it, scope a semantic motion token to a region through the selected framework's public API and allow its child components to inherit the override. This changes one shared timing value instead of rewriting Button, Switch, Input, or other component selectors.

The live playground changes these values for public VyrnForge Button and Switch examples. The preview's custom settings demonstrate consumer overrides, not alternate VyrnForge defaults. A consumer override must never re-enable non-essential motion for someone requesting reduced motion. Specific components may also disable transitions or animations directly in their canonical CSS.

## Native Web customization

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

## Motion and interaction contracts

A transition describes how a *visual state* changes; it does not decide whether the state changes. Toggle selection, commit, validation, focus, dismissal, and accessibility announcements occur according to the component contract whether duration is `120ms`, `0ms`, or motion is unsupported. Never wait on `transitionend`, `animationend`, a timeout, or an animation timeline to commit a UI action.

Avoid animating layout or focus placement for cosmetic effect. Reserve motion for useful orientation or feedback, keep control transitions short, and respect forced-colors, zoom, RTL, and browser limitations. Do not invent opacity/visibility transitions that accidentally leave invisible focusable descendants or a modal surface active.

## Loading is not decoration

Button's busy spinner and Loading's structured spinner/shimmer already share foundation timing and keyframe recipes. Loading state is semantic: a visual animation never substitutes for a real busy state, status message, or application-owned progress. Under reduced motion, the visual movement stops but the indicator and the meaningful state remain available. Do not speed up or loop decorative motion just because the tokens exist.

## When a new recipe is justified

The small, opt-in entrance vocabulary above is reusable on real Button, Switch, and composition wrappers without adding component-specific motion engines. Treat any further effect, complex spring-like movement, and especially component exit/enter lifecycle orchestration as a separate decision once multiple actual component consumers need the same observable behavior. Document supported browser capabilities, direction/writing-mode policy, lifecycle and focus invariants, reduced-motion fallback, styling hooks, and cross-framework expectations before exposing a stable utility. Prefer native CSS; do not add Framer Motion, a global animation controller, or a JavaScript timing dependency for component styling.

This utility covers the shared motion system. Button, Switch, Loading, Dialog, Drawer, and other components retain their own state, anatomy, and accessibility contracts.
