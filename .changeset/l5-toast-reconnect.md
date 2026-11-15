---
'@vyrnforge/elements': patch
---

Reset transient Toast timer and interaction pause state when a custom element disconnects, so reconnection starts a fresh open cycle without stale pauses.
