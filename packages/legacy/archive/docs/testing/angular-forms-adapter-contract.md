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

## Supported value models

The bridge defines one explicit conversion model for each of the fourteen
supported form-associated controls. The models are package-owned in
`forms-value-models.ts` and fall into five categories:

- **value** — `vf-date-input`, `vf-datetime-input`, `vf-search-input`,
  `vf-text-input`, and `vf-textarea` use string Angular values;
- **checked** — `vf-checkbox` and `vf-switch` use boolean Angular values, with a
  native mixed checked state represented as `null`;
- **numeric** — `vf-number-input`, `vf-rating`, and `vf-slider` use numeric
  Angular values. `vf-number-input` is string-backed natively, so finite native
  numeric strings are converted to numbers and its empty native value becomes
  `null`;
- **collection** — `vf-multi-select` and `vf-transfer-list` use immutable
  `readonly string[]` Angular values;
- **selection** — `vf-autocomplete` and `vf-select` use explicit string-or-null
  selection values rather than the generic text-value path.

Null writes use each native control's reset representation: empty string for
value/selection and `vf-number-input`, `false` for checked controls, `0` for the
numeric range/rating controls, and an empty array for collection controls.

The adapter does not silently coerce incompatible runtime values. It does not
stringify arbitrary values, boolean-coerce truthy/falsy values, rewrite
collection entries with `String(...)`, or accept numeric-looking strings for
number-valued rating/slider controls. Unsupported tags and incompatible values
produce an explicit `TypeError` so application model mistakes cannot silently
change meaning.

`vf-radio` and `vf-radio-group` remain excluded because radio-group registration
and identity require a dedicated Angular contract rather than a generic value
accessor.

## Evidence

The packed Angular fixture, conversion suite, and repository verifier must prove:

1. a reactive `FormGroup` writes and receives a `vf-text-input` value;
2. dirty and touched state propagate from native interaction;
3. disabling and enabling the `FormControl` updates the Custom Element and
   refreshes Angular validation;
4. native required validity appears as a `vyrnForge` Angular validation error;
5. the `vyrnForge` error exposes the native validation message and validity
   flags, including `valueMissing` for a required empty text input;
6. returning to a valid native value clears the Angular validation error;
7. template-driven `ngModel` writes and receives a `vf-checkbox` checked value;
8. value, checked, numeric, collection, and selection models each have explicit
   conversion coverage across all fourteen supported tags;
9. `vf-number-input` converts finite native numeric strings to Angular numbers,
   maps its empty native value to `null`, and rejects invalid numeric input;
10. collection conversion preserves string-array meaning without mutating or
    stringifying entries;
11. incompatible runtime values and unsupported tags fail explicitly instead of
    falling back to implicit conversion;
12. the existing native FormData/ElementInternals evidence remains intact;
13. Angular runtime dependencies remain confined to `@vyrnforge/ui-angular` and
    do not leak into framework-neutral VyrnForge foundations.

The verifier and deliberate failure tests are:

```text
packages/ui-angular/src/forms-value-models.test.ts
scripts/verify-angular-forms-adapter.mjs
scripts/verify-angular-forms-adapter.test.mjs
```
