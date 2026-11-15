---
"@vyrnforge/react": major
"@vyrnforge/vue": major
"@vyrnforge/angular": major
"@vyrnforge/elements": minor
"@vyrnforge/web": minor
---

Migrate ContextMenu to native auto popover anchored to the invoking element. React and Vue content stays mounted while closed; disabled commands in framework ports remain focusable using aria-disabled instead of native disabled. Keyboard ContextMenu/Shift+F10, Tab exit, outside dismissal and state reconciliation are supported. Elements authors should use aria-disabled for focusable unavailable commands; native disabled controls remain excluded.
