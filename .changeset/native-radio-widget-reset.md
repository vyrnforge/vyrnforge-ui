---
'@vyrnforge/react': patch
'@vyrnforge/vue': patch
'@vyrnforge/angular': patch
---

Keep SegmentedControl and Rating native radio selection synchronized after a non-canceled same-form reset. Restore initial uncontrolled selection, including empty selection, and retain the latest controlled value without emitting a fabricated selection intent.
