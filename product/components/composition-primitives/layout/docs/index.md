# Layout: Flow & AutoGrid

Build responsive arrangements with two shared CSS recipes on the semantic HTML you already need. Flow covers vertical rhythm, one-line rows, and wrapped peers; AutoGrid distributes repeated items in equal intrinsic tracks. These are styling recipes, not a family of React, Angular, Vue, or Custom Element layout components.

## Choose a layout

- Use `Flow` when related items need consistent spacing or alignment along one axis. Change its direction and wrapping without switching to a separate Stack, Inline, or Cluster abstraction.
- Use `AutoGrid` for repeated cards, summaries, or list items that should form as many equal-width columns as available space allows.
- Use ordinary CSS for content-width limits, centering, media aspect ratios, special grid arrangements, and surface paint. Use AppShell or an owning composite widget for structural or interactive responsibilities those capabilities actually own.

## Flow: vertical rhythm

A `data-vf-flow` host defaults to a column with a medium token gap, stretched children, and no wrapping. Set `data-vf-flow-gap="sm"` for a compact label/input/help relationship; the label, control, and description still need their normal native relationships. Use the semantic form, section, header, or list element that makes sense to the content.

## Flow: one inline row

Set `data-vf-flow-direction="inline"` for a row. By default it does not wrap; use short peers or an explicit, usable consumer overflow policy. `data-vf-flow-align="baseline"` aligns text baselines; `data-vf-flow-justify="space-between"` separates the two ends when space is available. These options also work on a block Flow where appropriate.

## Flow: wrapping peers

Add `data-vf-flow-wrap="wrap"` to an inline Flow when tags, metadata, filters, or actions must remain accessible at narrow widths. Wrap is a configuration of the same Flow recipe, not a Cluster component. The RTL example demonstrates how the authored `dir` affects inline visual direction without reordering the DOM or changing keyboard order. Wrap does not apply to block Flow.

## AutoGrid: intrinsic equal tracks

`data-vf-auto-grid` makes equal flexible tracks using `repeat(auto-fit, minmax(...))`. Its public `--vf-auto-grid-min-item-size` token defaults to `16rem` and may be overridden on the host (the example uses `10rem`). At a narrow width, the CSS algorithm reduces the number of tracks; it does not require a viewport breakpoint or script. Use `data-vf-auto-grid-gap` for spacing. Keep list semantics when repeated items form a list.

## Semantic groups and forms

Flow is presentation, not a form-field relationship or an accessible group. Use native `fieldset` and `legend` to name related radios, then put Flow on an inner element for spacing. Keep a shared radio `name` for selection behavior, label every input, and preserve normal Tab, arrow-key, and focus behavior. A visually joined control row does not create a ToggleGroup or Toolbar.

## Attributes and spacing

- `data-vf-flow`: activate the shared flex recipe, with block direction by default.
- `data-vf-flow-direction`: `block` (column) or `inline` (row).
- `data-vf-flow-wrap`: `nowrap` by default; `wrap` applies only when direction is inline.
- `data-vf-flow-gap` and `data-vf-auto-grid-gap`: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, or `3xl`; both default to `md`.
- `data-vf-flow-align`: `start`, `center`, `end`, `stretch`, or `baseline`. Default is stretch for block and center for inline.
- `data-vf-flow-justify`: `start`, `center`, `end`, or `space-between`; default is start.
- `--vf-auto-grid-min-item-size`: minimum preferred AutoGrid track size; `16rem` fallback. Complex named tracks, spans, and dense layouts remain ordinary CSS.

## Width, surfaces, and other non-layout responsibilities

The Page layout example uses application-authored `max-inline-size`, logical inline margins, and token-based padding for a constrained measure; no Container component is required. Its panels can use public surface color, border, and radius tokens without a Surface wrapper. An independently operable search input and button can remain native peers inside inline Flow; any specialized joined-border styling belongs to the control or application that owns it, not a generic ControlGroup API.

## Framework integration

Import `@vyrnforge/web/styles/layout.css` in the consuming app. Native Web and Elements-using apps author semantic HTML with the same data attributes. React uses these attributes on ordinary JSX elements, Angular on its authored template elements, and Vue on its authored elements. The checked-in Page layout example includes Native Web, React, Angular, Vue, and Elements-app source variants. No `@vyrnforge/web/layout`, `@vyrnforge/react/layout`, `@vyrnforge/angular/layout`, `@vyrnforge/vue/layout`, or Elements layout runtime is part of the current public API. Framework documentation rendering currently remains Native Web-first; the presence of source examples is not evidence of complete framework documentation views.

## Migration from older layout names

- Former Stack and `data-vf-stack`: use a semantic element with block `data-vf-flow`; transfer gap, align, and justify to `data-vf-flow-*`.
- Former Inline and `data-vf-inline`: use inline `data-vf-flow`, which is nonwrapping by default.
- Former Cluster and `data-vf-cluster`: use inline Flow with `data-vf-flow-wrap="wrap"`.
- Former AutoGrid React/Vue wrappers and Angular directive: use the existing `data-vf-auto-grid` hook on a native host; its CSS-only recipe remains.
- Former Container: use an authored semantic host with application CSS for max-width, logical gutters, and centering.
- Former ControlGroup: keep independent control semantics and use component/application-owned CSS where visual joining is actually needed. For semantic groups use native fieldset/legend or the correct composite widget.
- Former Surface: remains retired; use semantic HTML and shared surface tokens, not a wrapper.

## Accessibility, responsive behavior, and evidence

Neither CSS recipe adds ARIA roles, a focus manager, browser event handlers, selection state, or form validation. Keep headings/labels/landmarks and source order meaningful. Prefer wrapping or intrinsic tracks to viewport-specific breakpoints; test narrow layouts, text enlargement, RTL, themes, compact/comfortable density, focus, and forced-colors. Explicit gap attributes do not change automatically with density. This guide documents the private rebuild's current main branch, not a published stable release or blanket accessibility certification. Independent review and visual acceptance for the layout replacement continue to be tracked under issue `#1418`.
