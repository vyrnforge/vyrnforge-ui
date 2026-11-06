# Layer 2 — native-backed interactive controls

Button, Link, Checkbox and Switch use the approved L2 ownership hierarchy. The component ID remains the final directory name; source paths are not npm exports.

This migration moves Link, Checkbox and Switch with their product metadata, evidence, examples, browser fixtures and existing Web, React, Angular and Vue implementation sources. The old package-local implementation copies are removed, while public package entrypoints, package shells and framework-native semantics remain intact.

Native Web is the first implementation and evidence gate. Link decorates a native anchor; Checkbox uses a native checkbox and DOM indeterminate state; Switch uses a checkbox-backed role=switch. None should acquire collection navigation, popup behavior, complex form coordination or application business logic simply because its source moved.

Passing source discovery does not imply mature support. Verify native semantics, form participation, keyboard/focus, accessibility, RTL, theme, forced colors, packaging, SSR and clean consumers at the exact reviewed SHA. The remaining L2 controls are separate migration scopes and are not claimed complete by this wave.

NumberInput, NativeSelect and Slider are a second L2 source-ownership wave. They preserve native `input[type=number]`, `select`, and `input[type=range]` semantics respectively. Their existing package exports and CSS hooks remain unchanged. New framework-specific behavior or composite field patterns are out of scope.

FileInput, ColorInput and TemporalInput are a third source-migration wave. Their underlying native HTML input types, validation, browser pickers, accessible names, and form ownership must be preserved. No custom file uploader, color picker, or date/time overlay behavior is introduced by this migration.

Input and Textarea are now owned under L2. Their native editing, browser form semantics, selection, input modes and validation are retained, and the representative React profile-form fixture now refers to the canonical Input example path. The move does not create new form-field/group compositions or rewrite the approved input APIs.
