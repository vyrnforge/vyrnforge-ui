# Angular packed Custom Element consumer

CF-7003 establishes a clean Angular 22 runtime consumer of packed
`@vyrnforge/ui-elements` artifacts. CF-7004 adds a thin standalone Angular Forms
reference adapter over that same native renderer.

The fixture proves:

- standalone Angular bootstrap with `CUSTOM_ELEMENTS_SCHEMA`;
- explicit native element registration;
- Angular attribute, property, and DOM-event bindings;
- object-valued `vf-tabs.items` assignment without attribute serialization;
- named Light DOM composition through `vf-page-header`;
- native `ElementInternals` form submission inside an Angular template;
- reactive `FormGroup` / `formControlName` value synchronization;
- template-driven `ngModel` checked synchronization;
- dirty, touched, disabled, and native-validity propagation;
- production Angular application build and Chromium interaction;
- no Angular dependency in any VyrnForge package.

Use the opt-in standalone directive on supported form-associated elements:

```html
<vf-text-input vfFormControl formControlName="owner"></vf-text-input>
<vf-checkbox vfFormControl name="enabled" [(ngModel)]="enabled"></vf-checkbox>
```

The reference adapter is intentionally isolated under this consumer fixture. It
does not invent a published Angular package or alter the approved non-grid beta
release group. A published framework-integration package requires a separate
package-topology and release-policy decision.

Angular 22.0.x remains isolated from the repository workspace because it uses a
different TypeScript line from the VyrnForge workspace.
