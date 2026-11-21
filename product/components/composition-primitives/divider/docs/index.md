# Divider

A thin, visible line that visually separates adjacent areas of an interface. Divider supplies a consistent horizontal or vertical rule; it does not imply a semantic break or manage layout spacing.

## When to use

Use Divider to draw a clear straight line between content blocks, controls, or side-by-side regions when the separation is **visual only**. It is noninteractive and can be placed between ordinary native HTML elements or within VyrnForge Flow.

## Horizontal and vertical

Horizontal is the default: the line spans the available inline width with 1px block thickness. Vertical draws a 1px inline-width line and stretches to the available cross-axis height in a flex/grid row. Its parent must supply a usable height through its other content or explicit application sizing; the component does not set the parent's height.

## Appearance and tokens

The canonical stylesheet `@vyrnforge/web/styles/divider.css` uses `--vf-color-border` so light/dark/system themes apply without a separate Divider color API. Forced-colors mode uses a system color for visibility. No size variants, custom orientation breakpoints, or app-specific spacing rules are built in. Consumer CSS may place margins on the surrounding layout when needed.

Native Web uses:

```html
<link rel="stylesheet" href=".../@vyrnforge/web/styles/divider.css">
<span data-vf-divider data-vf-divider-orientation="horizontal" aria-hidden="true"></span>
<span data-vf-divider data-vf-divider-orientation="vertical" aria-hidden="true"></span>
```

## Accessibility

A visual line communicates **no additional accessible relationship**. The native host is a `span` with `aria-hidden="true"`; it is not focusable, has no `role="separator"`, and does not announce an orientation. Keep meaningful groups, headings, and focus order in the surrounding native markup.

## When not to use

Use native `<hr />` for a real thematic break in text/content. For Menu and Toolbar use their existing `MenuSeparator` and `ToolbarSeparator`. The interactive SplitPanel handle is a separate keyboard-operated resizing control. The retired semantic `Separator` component and `data-vf-separator` hooks are not restored.

## Framework consumption

Native Web and Elements applications author the same `data-vf-divider` CSS hook on an accessible decorative span. React offers a typed convenience component over that same styling; a React runtime is not required by Web CSS. Angular and Vue can apply the CSS hook directly without new wrapper components.
