# TextField

TextField composes a visible label, one native input or textarea, optional adornments and accessible description/error relationships. It does not own a form store or business validation.

## When to use

Use Input or Textarea alone for independently authored semantic forms. Use TextField for repeated labeled fields with consistent appearance, help and error relationships. Use existing SearchField, PasswordField and NumberField when their specialized query, visibility or stepping behavior is required. Native temporal and color modes remain Input.

## Appearance and typography

Outlined is the default; filled uses a subtle surface while keeping a visible boundary. Omitted field size follows inherited density; explicit sm, md and lg select shared control geometry. Native input size, textarea rows and cols remain native. Full width is optional. Logical start/end alignment supports RTL. Leading/trailing slots accept authored artwork or actions; prefix/suffix are visible text. Meaningful units must also be named in label or description. Actions must use accessible names, type=button, and consumer-managed disabled/read-only policy.

Typography uses the shared font family, size, weight and line-height roles. The existing theme authoring function accepts component-specific CSS font shorthand and letter-spacing tokens for value, placeholder, label, message and affix. The placeholder inherits value typography by default. Also supported: --vf-text-field-radius, --vf-text-field-background and --vf-text-field-border-color. These optional overrides inherit through theme scopes; absent values resolve at the consuming CSS declaration to shared semantic defaults. No component theme runtime is required. Verify custom contrast and readable geometry.

## Native behavior and validation

Native value, defaultValue, change events, focus, selection, composition, paste, autocomplete, input mode, required, disabled, readonly, form association, reset and submission are preserved. Controlled values and reset are consumer-owned. Native invalid presentation uses user-invalid; authored error text marks aria-invalid and is appended to aria-describedby without dropping external descriptions. Warning/success are presentation only; author meaningful text and do not rely on color. No automatic live announcements or focus movement. Requiredness conventions are localized and authored in the label or form instructions.

Multiline uses a native textarea, preserving rows and columns; autosize is progressive enhancement using CSS field-sizing where supported, otherwise native resize and rows apply. Character limits use native maxlength; a visible counter can be consumer-authored as description. Use tolerant native text entry and explicit parsing at a suitable boundary for currency, percentage and masks; never silently rewrite editing text or composition.

## Native Web

Load `@vyrnforge/web/styles/text-field.css`. Author the same hooks on a div root, label, control wrapper, real input (data-vf-input and data-vf-text-field-value) or textarea (data-vf-textarea and data-vf-text-field-value), and optional described text. Author unique IDs, label for, aria-describedby and aria-invalid. No new element or controller is required. React-first evidence does not establish other framework adapter support.
