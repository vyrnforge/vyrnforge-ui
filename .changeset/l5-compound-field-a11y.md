---
"@vyrnforge/react": major
"@vyrnforge/angular": major
"@vyrnforge/vue": major
"@vyrnforge/elements": patch
---

Repair Layer 5 compound-field accessibility ownership.

ColorPicker text inputs and NumberField step controls no longer fabricate hidden English accessible names; consumers must author the appropriate label through native labeling or ARIA. FileUploader dropzones now activate native file selection from Enter and Space across framework and Elements ports, and the Elements port now emits file-change intent for native input selection as well as drag-and-drop.
