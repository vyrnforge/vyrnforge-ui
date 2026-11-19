---
'@vyrnforge/web': major
'@vyrnforge/react': major
'@vyrnforge/angular': major
'@vyrnforge/vue': major
---

Replace six separate layout APIs with two canonical Web CSS-only composition recipes: Flow and AutoGrid. Remove redundant Stack/Inline/Cluster/Container/ControlGroup visual hooks and React/Vue/Angular layout components/directives. Retain `@vyrnforge/web/styles/layout.css`; migrate consumers to authored semantic HTML and the new `data-vf-flow` hook. See issue #1418 for breaking old-to-new migration mapping; no package publication is authorized.
