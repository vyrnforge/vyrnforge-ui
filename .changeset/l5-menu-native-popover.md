---
'@vyrnforge/web': minor
'@vyrnforge/react': major
'@vyrnforge/angular': minor
'@vyrnforge/vue': major
'@vyrnforge/elements': minor
---

Migrate Menu to native auto Popover and CSS Anchor Positioning. The menu content now remains mounted while closed; the browser owns top-layer stacking and light dismissal, while each port owns committed state and keyboard/focus policy. Existing authored names and IDs remain supported. SplitButton and Menubar continue composing Menu; no general overlay runtime is added.
