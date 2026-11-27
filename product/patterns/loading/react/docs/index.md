# React Loading

## React setup

Use the native-first adapter with `@vyrnforge/react/loading`. All parts forward refs and native attributes appropriate to their host element. The CSS and motion are shared with Native Web. CSS-aware browser bundlers load the component styles automatically.

| Export | Host | Props |
| --- | --- | --- |
| Loading | div | size, children, div attributes |
| LoadingIndicator | span | variant, decorative span attributes |
| LoadingPlaceholder (legacy) | div | migrate to Skeleton |
| LoadingProgress (legacy) | progress | migrate to Progress |
| LoadingCustom | div | authored children and div attributes |

The indicator and placeholder are decorative; supply equivalent status text where needed. Label progress using native labeling or aria-label. Omit value for unknown progress. Application state, polling, retry and cancellation are not owned by this API. Custom content and CSS variable overrides remain supported.

New code uses `Skeleton` from `@vyrnforge/react/skeleton` and `Progress` from `@vyrnforge/react/progress`. Loading's playground is for compact indeterminate indicators and custom artwork only.
