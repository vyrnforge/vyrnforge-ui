---
"@vyrnforge/react": major
"@vyrnforge/angular": major
"@vyrnforge/vue": major
"@vyrnforge/elements": patch
"@vyrnforge/web": patch
---

Menu uses native auto popover and CSS anchor placement, retains command navigation and committed dismissal, and owns trigger/content relationships at root. Move content id to MenuRoot contentId; Angular requires stable root id. No portal or floating runtime is required by Menu.
