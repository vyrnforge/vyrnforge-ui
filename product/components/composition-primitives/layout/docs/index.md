# Layout: Flow & AutoGrid

Build responsive arrangements with two shared CSS recipes on the semantic HTML you already need. Flow covers vertical rhythm, one-line rows, and wrapped peers; AutoGrid distributes repeated items in equal intrinsic tracks. These are styling recipes at the shared foundation. React additionally provides simple `Flow` and `AutoGrid` components mapping typed props to those same CSS hooks; Angular, Vue and Elements do not require a framework layout runtime.

## Choose a layout

- Use `Flow` when related items need consistent spacing or alignment along one axis. Change its direction and wrapping without switching to a separate Stack, Inline, or Cluster abstraction.
- Use `AutoGrid` for repeated cards, summaries, or list items that should form as many equal-width columns as available space allows.
- Use ordinary CSS for content-width limits, centering, media aspect ratios, special grid arrangements, and surface paint. Use AppShell or an owning composite widget for structural or interactive responsibilities those capabilities actually own.

## Flow: vertical rhythm

A `data-vf-flow` host defaults to a column with a density-aware token gap, stretched children, and no wrapping. With public foundation.css loaded, the comfortable default is md and compact default is sm; explicit gap attributes are deliberate overrides. This means the basic label/Input/help example needs no per-instance inline width, margins or spacing. The label, control, and description still need their normal native relationships. Use the semantic form, section, header, or list element that makes sense to the content.

## Flow: one inline row

Set `data-vf-flow-direction="inline"` for a row. By default it does not wrap; use short peers or an explicit, usable consumer overflow policy. `data-vf-flow-align="baseline"` aligns text baselines; `data-vf-flow-justify="space-between"` separates the two ends when space is available. These options also work on a block Flow where appropriate.

## Flow: wrapping peers

Add `data-vf-flow-wrap="wrap"` to an inline Flow when tags, metadata, filters, or actions must remain accessible at narrow widths. Wrap is a configuration of the same Flow recipe, not a Cluster component. The RTL example demonstrates how the authored `dir` affects inline visual direction without reordering the DOM or changing keyboard order. Wrap does not apply to block Flow.

## AutoGrid: intrinsic equal tracks

`data-vf-auto-grid` makes equal flexible tracks using `repeat(auto-fit, minmax(...))`. Its public `--vf-auto-grid-min-item-size` token defaults to `16rem` and may be overridden on the host when the application truly needs another track minimum (the checked-in examples now use the default). At a narrow width, the CSS algorithm reduces the number of tracks; it does not require a viewport breakpoint or script. Use `data-vf-auto-grid-gap` for spacing. Keep list semantics when repeated items form a list. On `ul`/`ol` hosts that explicitly opt into AutoGrid, shared Web CSS removes user-agent margin/indent and places native markers inside each grid item; it does not set `list-style: none` or suppress native list accessibility. Ordinary content paint, bounded reading measures and any deliberately markerless list treatment remain the consuming application’s responsibility.

## Semantic groups and forms

Flow is presentation, not a form-field relationship or an accessible group. Use native `fieldset` and `legend` to name related radios, then put Flow on an inner element for spacing. Keep a shared radio `name` for selection behavior, label every input, and preserve normal Tab, arrow-key, and focus behavior. A visually joined control row does not create a ToggleGroup or Toolbar.

## Dividers and thematic breaks

A separator is not a standalone VyrnForge elemental primitive. Use native `<hr>` when the content has a real thematic break; its native separator semantics require no extra role, focus handling, or React-specific runtime. On a Flow layout, a semantic `hr` remains an ordinary child. Its visual border can use `var(--vf-color-border)` with CSS logical properties for RTL/writing-mode support.

For appearance-only division, put a `border-block-start` or `border-inline-start` on the owning element using shared border/spacing tokens. A purely visual line does not create a new accessibility role or thematic break. For example, in application-owned CSS:

```css
.settings-group + .settings-group {
  border-block-start: 1px solid var(--vf-color-border);
  padding-block-start: var(--vf-space-md);
}
```

In ordinary menus and toolbars, use the owning `MenuSeparator` or `ToolbarSeparator` instead of a generic separator or an `hr` unrelated to the composite's anatomy. Never substitute a static separator for a focusable SplitPanel resize handle.

The generic `Separator`, `data-vf-separator`, and `@vyrnforge/react/separator` APIs were intentionally retired. No orientation, thickness, decorative, or vertical-divider component API is implied by these examples.

## Attributes and spacing

- `data-vf-flow`: activate the shared flex recipe, with block direction by default.
- `data-vf-flow-direction`: `block` (column) or `inline` (row).
- `data-vf-flow-wrap`: `nowrap` by default; `wrap` applies only when direction is inline.
- `data-vf-flow-gap` and `data-vf-auto-grid-gap`: optional overrides `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, or `3xl`. Omitted gaps inherit comfortable md or compact sm from public foundation.css; with granular Layout CSS alone the fallback is md. Explicit values never get silently remapped.
- `data-vf-flow-align`: `start`, `center`, `end`, `stretch`, or `baseline`. Default is stretch for block and center for inline.
- `data-vf-flow-justify`: `start`, `center`, `end`, or `space-between`; default is start.
- `--vf-auto-grid-min-item-size`: minimum preferred AutoGrid track size; `16rem` fallback. Complex named tracks, spans, and dense layouts remain ordinary CSS.

## Density and centralized defaults

For eligible shared composition and form controls, one inherited `data-vf-density="compact"` scope (on the root or a subtree) remaps only omitted Flow/AutoGrid rhythm and Input height/padding through private CSS aliases. Comfortable is the default; theme and component size remain separate axes. Public foundation.css supplies that inherited mapping, while each granular component stylesheet keeps a safe comfortable fallback. Existing Button and NativeSelect use the same foundation control-height mechanism. No JavaScript config provider or per-instance density props are needed; a future app config may set the existing DOM scope. Preserve explicit spacing choices when an actual layout calls for them.

## Width, surfaces, and other non-layout responsibilities

Page-specific `max-inline-size`, logical inline margins and gutters remain application CSS, not a Container component API. Layout examples intentionally avoid repetitive inline styles; the documentation preview may constrain its own demonstration canvas. Surfaces can use public color, border and radius tokens in application/owning CSS without a Surface wrapper. An independently operable search input and button can remain native peers inside inline Flow; any specialized joined-border styling belongs to the control or application that owns it, not a generic ControlGroup API.

## Framework integration

Import `@vyrnforge/web/styles/layout.css` in the consuming app. Native Web and Elements-using apps author semantic HTML with the same data attributes. React apps can use `Flow` and `AutoGrid` from `@vyrnforge/react/layout` with typed props and semantic `as` hosts; Angular and Vue apps use the canonical CSS attributes on authored native elements. The checked-in Page layout example includes Native Web, React, Angular, Vue, and Elements-app source variants. `@vyrnforge/react/layout` provides only the two React authoring components; `@vyrnforge/web/layout`, `@vyrnforge/angular/layout`, `@vyrnforge/vue/layout`, and Elements layout runtime do not exist. The React documentation app also has a dedicated Layout guide at `/next/react/components/layout/` using product-owned TSX examples. Other framework documentation renderers remain separate delivery scopes; example sources do not imply full Angular, Vue, or Elements documentation sites.

## Migration from older layout names

- Former Stack and `data-vf-stack`: use React `Flow` in block mode (default), or a native element with `data-vf-flow` in other frameworks. Transfer gap/align/justify to matching React props or CSS hooks.
- Former Inline and `data-vf-inline`: use React `Flow direction="inline"`, or an inline `data-vf-flow` hook in other frameworks; neither wraps by default.
- Former Cluster and `data-vf-cluster`: use React `Flow direction="inline" wrap="wrap"`, or the corresponding inline/wrap CSS hooks in other frameworks.
- Former AutoGrid React/Vue wrappers and Angular directive: use the new minimal React `AutoGrid` API, or `data-vf-auto-grid` directly in other frameworks. Canonical Web CSS continues to implement the grid.
- Former Container: use an authored semantic host with application CSS for max-width, logical gutters, and centering.
- Former ControlGroup: keep independent control semantics and use component/application-owned CSS where visual joining is actually needed. For semantic groups use native fieldset/legend or the correct composite widget.
- Former Surface: remains retired; use semantic HTML and shared surface tokens, not a wrapper.
- Former standalone Separator: use native `hr` for thematic breaks, token-driven CSS borders for visual division, and context-owned separators in Menu/Toolbar.

## Accessibility, responsive behavior, and evidence

Neither CSS recipe adds ARIA roles, a focus manager, browser event handlers, selection state, or form validation. Keep headings/labels/landmarks and source order meaningful. Prefer wrapping or intrinsic tracks to viewport-specific breakpoints; test narrow layouts, text enlargement, RTL, themes, compact/comfortable density, focus, and forced-colors. Explicit gap attributes do not change automatically with density. This guide documents the private rebuild's current main branch, not a published stable release or blanket accessibility certification. Independent review and visual acceptance for the layout replacement continue to be tracked under issue `#1418`.
