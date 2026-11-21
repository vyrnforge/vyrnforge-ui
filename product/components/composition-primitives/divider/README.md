# Divider — visual content boundary

A small, noninteractive visual-only composition primitive. Unlike the retired generic semantic `Separator`, Divider intentionally **does not** introduce `role=separator` or thematic-break meaning; use native `hr` for that. The reusable need is a visible 1px horizontal/vertical rule with shared theme colors and no app-authored geometry boilerplate.

Native Web: `<span data-vf-divider data-vf-divider-orientation="horizontal" aria-hidden="true"></span>` and `@vyrnforge/web/styles/divider.css`.

React: `<Divider />` or `<Divider orientation="vertical" />` from `@vyrnforge/react/divider`. Render a native `span` with a forwarded ref. Orientation is **visual configuration**, not ARIA orientation. The CSS rule inherits theme border color from the canonical Web token and uses 1px thickness. Vertical divider needs a row/grid/flex parent with measurable height to stretch.

This scoped admission is a new **visual composition** capability responding to a specific consumer need, not reinstatement of the removed generic `Separator` semantics, styling hooks, or framework clones. See issue #1458.
