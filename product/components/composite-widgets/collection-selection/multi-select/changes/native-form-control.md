---
type: minor
---

Add opt-in MultiSelectFormControl (React/Vue), VfMultiSelectFormControlComponent (Angular), and authored native select part (Elements) for native form association, required validation, semantic value submission and reset. Supply the same stable option keys and labels to the form-control options and popup. Single Select uses an explicit empty-value first option for an unselected required field. Root disabled state applies to the native control and interaction; controlled reset preserves owner value and uncontrolled reset restores the initial default without emitting selection intent. Invalid native control events surface browser-localized validation text, associate it with the visible trigger, and move focus to that trigger. Ordinary native select remains the preferred form control when sufficient. Custom popup activation remains client-dependent.
