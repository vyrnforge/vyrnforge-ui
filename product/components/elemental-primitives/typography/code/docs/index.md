# Code

Code is specialized typography for native inline and block code.

Use native `code`/`pre` semantics and load `@vyrnforge/web/styles/code.css`. Code presentation may compose with the shared Text typography hooks on the same native element. The Text role controls shared size/weight/line-height treatment; Code retains monospace identity and code-specific surface treatment.

Code is read-only presentation. Editing, caret/selection behavior, syntax engines, autocomplete, diagnostics, and CodeEditor experiences belong to higher layers.
