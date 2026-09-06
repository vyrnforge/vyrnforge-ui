# Angular Forms adapter contract

The supported Angular Forms bridge adapts the canonical VyrnForge form-associated
Custom Elements to Angular Forms. It does not create a second renderer or a
second validation model.

## Supported integration

`VyrnForgeFormControlDirective` is package-owned and exported from the dedicated
Forms entrypoint:

```text
packages/ui-angular/src/forms.ts
@vyrnforge/ui-angular/forms
```

Consumers opt in with `vfFormControl` on a supported VyrnForge form-associated
Custom Element. The standalone directive provides Angular's `NG_VALUE_ACCESSOR`
and `NG_VALIDATORS` contracts and works with both reactive and template-driven
Forms.

```html
<vf-text-input vfFormControl formControlName="owner" required></vf-text-input>

<vf-checkbox
  vfFormControl
  name="notifications"
  [(ngModel)]="notifications"
></vf-checkbox>
```

## Ownership boundary

The adapter translates Angular conventions only:

- `writeValue` assigns the canonical native `value` or `checked` property;
- `vf-value-change` and `vf-checked-change` notify Angular of user changes;
- external `focusout` notifies Angular that the control is touched and requests
  a validator refresh;
- `setDisabledState` assigns the native `disabled` property and requests a
  validator refresh;
- `vf-invalid` requests a validator refresh without replacing the native
  validity source;
- the Angular `Validator` reads native `validity`, `willValidate`, and
  `validationMessage` after the VyrnForge control updates;
- invalid native validity is exposed under the single Angular `vyrnForge` error
  with the canonical message and a serialized validity snapshot.

Rendering, keyboard behavior, ElementInternals form participation, validation
rules, messages, focus behavior, tokens, and accessibility remain owned by
`@vyrnforge/ui-elements`.

Validator refreshes are queued in a microtask so Angular observes the canonical
Custom Element state after value, checked, disabled, invalid, or touched
transitions have settled. Disabled or non-validating native elements produce no
Angular validation error.

## Supported values

The bridge covers string, number, boolean, and string-array form values across
fourteen form-associated tags. `vf-radio` and `vf-radio-group` remain excluded
because radio-group registration and identity require a dedicated Angular
contract rather than a generic value accessor.

## Evidence

The packed Angular fixture and repository verifier must prove:

1. a reactive `FormGroup` writes and receives a `vf-text-input` value;
2. dirty and touched state propagate from native interaction;
3. disabling and enabling the `FormControl` updates the Custom Element and
   refreshes Angular validation;
4. native required validity appears as a `vyrnForge` Angular validation error;
5. the `vyrnForge` error exposes the native validation message and validity
   flags, including `valueMissing` for a required empty text input;
6. returning to a valid native value clears the Angular validation error;
7. template-driven `ngModel` writes and receives a `vf-checkbox` checked value;
8. the existing native FormData/ElementInternals evidence remains intact;
9. Angular runtime dependencies remain confined to `@vyrnforge/ui-angular` and
   do not leak into framework-neutral VyrnForge foundations.

The verifier and deliberate failure tests are:

```text
scripts/verify-angular-forms-adapter.mjs
scripts/verify-angular-forms-adapter.test.mjs
```
