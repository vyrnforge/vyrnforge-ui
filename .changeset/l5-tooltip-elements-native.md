---
"@vyrnforge/react": major
"@vyrnforge/vue": major
"@vyrnforge/angular": major
"@vyrnforge/elements": patch
"@vyrnforge/web": patch
---

Migrate Tooltip to native anchored popover across runtime ports. Root owns content IDs; Vue uses a native trigger child instead of a wrapper. Angular requires a stable root ID. Preserve description relationships, hover/focus persistence and Escape dismissal.
