---
"@vyrnforge/react": major
"@vyrnforge/vue": major
"@vyrnforge/angular": major
"@vyrnforge/elements": major
"@vyrnforge/web": patch
---

Make FileUploader dropzone a native button, and keep dropped files, selected-file list, native FormData and reset consistent. React/Vue render button rather than div; Angular and Elements consumers migrate authored dropzones to button type="button" (keep existing directive/data hooks). React refs and props use HTMLButtonElement; file input no longer exposes value/defaultValue/type overrides. Single-file inputs accept the first dropped file; native accept remains advisory. A reset that clears selected files reports an empty FileList through the existing selection-change callback/event, without synthetic native input/change events. Upload and validation policy remain application-owned.
