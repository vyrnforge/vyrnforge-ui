---
"@vyrnforge/web": patch
---

Move the shared Listbox, Select, Combobox, and MultiSelect surface/option/trigger styling into one private Web selection stylesheet so granular component entrypoints compose deliberate shared infrastructure instead of using Listbox or Select as accidental sibling style owners.
