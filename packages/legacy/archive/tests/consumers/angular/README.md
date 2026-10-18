# Angular packed Custom Element consumer

CF-7003 establishes a clean Angular 22 runtime consumer of packed
`@vyrnforge/ui-elements` artifacts. CF-7004 introduced the generic Angular Forms
reference adapter over that same native renderer; MFD-1205 promotes that proven
adapter into the supported `@vyrnforge/ui-angular/forms` package entrypoint.

The fixture proves:

- standalone Angular bootstrap with `CUSTOM_ELEMENTS_SCHEMA`;
- canonical VyrnForge element registration through the Angular package;
- Angular attribute, property, and DOM-event bindings;
- object-valued `vf-tabs.items` assignment without attribute serialization;
- named Light DOM composition through `vf-page-header`;
- native `ElementInternals` form submission inside an Angular template;
- reactive `FormGroup` / `formControlName` value synchronization through the package Forms bridge;
- template-driven `ngModel` checked synchronization through the package Forms bridge;
- dirty, touched, disabled, and native-validity propagation;
- production Angular application build and Chromium interaction;
- no copied `ControlValueAccessor` implementation in the consumer fixture.

Use the opt-in standalone directive on supported form-associated elements:

```ts
import { VyrnForgeFormControlDirective } from "@vyrnforge/ui-angular/forms";
```

```html
<vf-text-input vfFormControl formControlName="owner"></vf-text-input>
<vf-checkbox vfFormControl name="enabled" [(ngModel)]="enabled"></vf-checkbox>
```

The Forms bridge stays isolated behind the package `./forms` subpath so
`@angular/forms` remains optional for applications that only consume the core
Angular facade.

Angular 22.0.x remains isolated from the repository workspace because it uses a
different TypeScript line from the VyrnForge workspace.
