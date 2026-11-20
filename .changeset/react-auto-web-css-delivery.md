---
"@vyrnforge/react": minor
---

React component imports now automatically bring canonical @vyrnforge/web CSS into CSS-aware browser bundles through conditional package exports. Granular subpaths include only their component styling and declared dependencies; the root import includes the complete Web aggregate. Direct Node/SSR ESM imports remain CSS-free, and the optional reset is never auto-loaded.
