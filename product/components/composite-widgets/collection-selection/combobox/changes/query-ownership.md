---
type: major
---

Combobox separates the selected semantic key (`value/defaultValue`) from editable text (`query/defaultQuery`). A user edit requests query change, not selection. Committing an uncontrolled or accepted controlled option requests its authored `textValue` (falling back to value), not the key. A rejected controlled selection does not overwrite the query. A later owner value change matching the pending request may complete it unless a new query edit or selection supersedes it; unrelated owner changes do not fabricate query intent. Controlled query remains authoritative. React uses onQueryChange, Vue update:query, and Angular queryChange; migrate input value/defaultValue to the root. Angular root query is now the input contract and queryText is derived. Native Elements keeps its authored input and selected value attribute. A named native input submits query text; selected-key serialization remains consumer-owned.
