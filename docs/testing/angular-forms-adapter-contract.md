# Angular Forms adapter contract

CF-7004 adds a thin Angular Forms bridge for the existing native
`@vyrnforge/ui-elements` renderer. It does not create a second Angular renderer,
change the four-package non-grid beta release group, or add Angular dependencies
to VyrnForge packages.

## Reference integration

The standalone `VyrnForgeFormControlDirective` lives in the isolated Angular
consumer fixture:

```text
tests/consumers/angular/src/app/vyrnforge-form-control.directive.ts
```

Consumers opt in with `vfFormControl` on a supported VyrnForge form-associated
Custom Element. The directive provides Angular's `NG_VALUE_ACCESSOR` and
`NG_VALIDATORS` contracts and can be used by both reactive and template-driven
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

- `writeValue` assigns the native `value` or `checked` property;
- `vf-value-change` and `vf-checked-change` notify Angular of user changes;
- `focusout` notifies Angular when the control is touched;
- `setDisabledState` assigns the native `disabled` property;
- the `Validator` implementation reads native `validity` and
  `validationMessage` after the VyrnForge control updates.

Rendering, keyboard behavior, ElementInternals form participation, validation
rules, messages, focus behavior, tokens, and accessibility remain owned by
`@vyrnforge/ui-elements`.

## Supported values

The initial reference adapter covers string, number, boolean, and string-array
form values across fourteen form-associated tags. `vf-radio` and
`vf-radio-group` remain excluded because radio-group registration and identity
need a dedicated Angular contract rather than a generic value accessor.

## Evidence

The packed Angular fixture must prove:

1. a reactive `FormGroup` writes and receives a `vf-text-input` value;
2. dirty and touched state propagate from native interaction;
3. disabling and enabling the `FormControl` updates the Custom Element;
4. native required validity appears as a `vyrnForge` Angular validation error;
5. template-driven `ngModel` writes and receives a `vf-checkbox` checked value;
6. the existing native FormData/ElementInternals evidence remains intact;
7. no package under `packages/` depends on Angular.

The verifier and deliberate failure tests are:

```text
scripts/verify-angular-forms-adapter.mjs
scripts/verify-angular-forms-adapter.test.mjs
```
