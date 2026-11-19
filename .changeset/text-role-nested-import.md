---
"@vyrnforge/web": patch
---

Remove a redundant nested token import from the internal typography-role stylesheet. Public Text and Native Elements styles already import tokens explicitly, so the role CSS can reuse those tokens without creating a duplicated import chain or confusing nested CSS URL resolvers during accessibility testing. Public selectors, package entrypoints, and typography roles are unchanged.
