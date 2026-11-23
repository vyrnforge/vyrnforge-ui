---
'@vyrnforge/web': patch
---

Make SearchField clear-button cursor, disabled, focus and forced-color styling canonical in the shared Web stylesheet instead of relying on documentation-only CSS. React, Native Web and the other framework ports consume the same SearchField appearance; documentation chrome remains app-owned and isolated from standalone examples.
