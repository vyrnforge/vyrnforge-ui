---
"@vyrnforge/web": patch
---

Replace Theme Toggle's hand-drawn dragon approximation with the exact horizontal dragon geometry traced from the approved toggle-scale artwork. Light and dark now reuse the same eleven SVG paths; dark mode mirrors that SVG and changes only its palette while the native thumb continues to move between theme states. Native switch semantics, RTL behavior, reduced-motion handling, forced-colors fallback, and existing public data hooks remain unchanged.
