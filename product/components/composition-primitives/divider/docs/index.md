# Divider

A visible, thin, token-driven line between UI areas. Divider can also hold short text placed at the start, center or end of a horizontal or vertical rule. It is visual composition, not a semantic thematic break or interactive separator.

## When to use

Use Divider to visually separate adjacent sections, content blocks or short metadata. Include a short text label such as “OR”, “Today” or “Next” when useful context belongs inside the line. Avoid putting buttons, links or any other interactive controls inside Divider.

## Horizontal and vertical

The default horizontal Divider draws a 1px full-width rule. The vertical Divider draws a 1px line stretched to the available cross-axis height of its row/grid context. A parent must provide a measurable height; Divider does not impose application dimensions.

When labeled, the line becomes two 1px CSS-painted segments flanking the readable text, not an extra accessible separator element. For vertical orientation, segments are above and below the text. Existing labels default to vertical top-to-bottom text (`writing-mode: vertical-rl`), but the same native CSS can display horizontal text or bottom-to-top vertical text when requested. In every mode, the text remains real selectable, accessible text.

## Text and alignment

Text is optional, and the label is positioned along the line with logical `start`, `center` (default), or `end` alignment. In horizontal RTL layouts, start follows the inline start (the right edge). In the vertical variant, start is the top and end the bottom in horizontal writing modes. The position affects available line-segment length, not reading order.

The native HTML styling contract uses a parent `data-vf-divider-labeled` and a `data-vf-divider-label` text child. Do not apply `aria-hidden="true"` to labeled lines. Standalone unlabelled decorative dividers retain `aria-hidden="true"`.

```html
<span data-vf-divider data-vf-divider-orientation="horizontal"
      data-vf-divider-labeled data-vf-divider-align="center">
  <span data-vf-divider-label>OR</span>
</span>

<span data-vf-divider data-vf-divider-orientation="vertical"
      data-vf-divider-labeled data-vf-divider-align="end">
  <span data-vf-divider-label>Next</span>
</span>
```

## Vertical label direction

For a labeled **vertical** Divider only, the visible text can be `top-to-bottom` (default), `bottom-to-top`, or `horizontal`. The shared native hook is `data-vf-divider-text-direction` on the labeled vertical host; the React convenience prop is `textDirection`. Omit the option to retain the previous top-to-bottom default. Horizontal text stays upright between vertical segments; bottom-to-top rotates the native vertical text, without reversing DOM reading order. This is not the native `dir` or CSS bidi direction; writing direction and `textAlign` are independent.

```html
<span data-vf-divider data-vf-divider-orientation="vertical" data-vf-divider-labeled
      data-vf-divider-align="center" data-vf-divider-text-direction="horizontal">
  <span data-vf-divider-label>OR</span>
</span>
<span data-vf-divider data-vf-divider-orientation="vertical" data-vf-divider-labeled
      data-vf-divider-align="center" data-vf-divider-text-direction="bottom-to-top">
  <span data-vf-divider-label>Previous</span>
</span>
```

## Appearance and tokens

Import `@vyrnforge/web/styles/divider.css`. Both plain and labeled variants use the canonical `--vf-color-border` token; label text inherits the surrounding text color. The spacing around text uses the shared `--vf-space-sm` token. Forced-colors mode uses CanvasText for line segments. Plain dividers preserve the existing 1px geometry and no styling or behavior provider is needed. Short labels are recommended so text enlargement and localization fit the available space. Consumer CSS owns any container sizing or outer margins.

## Accessibility

Unlabeled lines are purely decorative native `span` elements with `aria-hidden="true"`. Labeled dividers **must not hide text**: their native text remains accessible and no separator role or orientation is announced. The CSS line segments are presentation-only; they cannot receive focus. The textual label does not magically label neighboring controls or convey a form relationship—use native headings, `fieldset`/`legend`, and explicit associations when those semantics are required.

## When not to use

Use native `<hr />` for a meaningful thematic break. For Menu and Toolbar use their owned `MenuSeparator` and `ToolbarSeparator`; a SplitPanel resize handle remains interactive. The retired generic `Separator` and `data-vf-separator` are not reinstated. Do not use Divider as a heading substitute or as a focusable control.

## Framework consumption

Native Web, Elements, Angular and Vue consumers can use the shared styling hooks on native spans without new runtime wrappers. React offers the small typed convenience API `@vyrnforge/react/divider`, which authors the same markup and retains native text accessibility.
