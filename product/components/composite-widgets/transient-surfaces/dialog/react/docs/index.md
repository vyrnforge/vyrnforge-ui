# React Dialog

Use the public React entrypoint `@vyrnforge/react/dialog`. CSS-aware browser bundlers select the canonical Web stylesheet automatically; explicit Web CSS imports are only a fallback for other bundlers.

## React setup

See the executable examples below. The application owns the open state, action consequences and appropriate focus recovery. No separate React stylesheet or global overlay/notification runtime is needed.

## Header, body and footer

Use `DialogHeader`, `DialogBody` and `DialogFooter` to compose the surface. Header and Footer accept native div attributes and optional `divider`. Keep the title and optional description inside Header; place task content in Body and authored actions in Footer. All regions are optional and existing flat compositions continue to work. Styles inherit shared Web tokens and load with CSS-aware component imports.
