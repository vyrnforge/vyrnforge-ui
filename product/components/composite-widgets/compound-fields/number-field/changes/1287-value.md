---
type: major
---

NumberField value is a finite number or null (empty). The native number input owns unparseable editing text, native validity and native stepping. Finite out-of-range or step-mismatched edits retain their native validity rather than being silently clamped. Root constraints and committed state are authoritative in the framework ports; controls use the owned native input's stepUp/stepDown, not arithmetic that can diverge from platform step bases and precision. Controlled rejection restores the owner value. Move value/defaultValue/min/max/step from input to root and handle null in callbacks. Root disabled/readOnly applies to its parts; consumer-authored input and button names remain required. Native reset and broader cross-engine, SSR/hydration and manual evidence remain open.
