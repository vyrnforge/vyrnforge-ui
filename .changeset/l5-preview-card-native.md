---
"@vyrnforge/react": major
"@vyrnforge/angular": major
"@vyrnforge/vue": major
"@vyrnforge/elements": patch
"@vyrnforge/web": patch
---

Migrate PreviewCard to native anchored popover, preserving pointer and keyboard access. Root owns content IDs, Angular requires stable root id, and Vue attaches to a native trigger child.
