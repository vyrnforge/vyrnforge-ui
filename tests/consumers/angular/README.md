# Angular packed Custom Element consumer

CF-7003 upgrades the Angular architecture example to a clean Angular 22 runtime
consumer of packed `@vyrnforge/ui-elements` artifacts.

The fixture proves:

- standalone Angular bootstrap with `CUSTOM_ELEMENTS_SCHEMA`;
- explicit native element registration;
- Angular attribute, property, and DOM-event bindings;
- object-valued `vf-tabs.items` assignment without attribute serialization;
- named Light DOM composition through `vf-page-header`;
- native `ElementInternals` form submission inside an Angular template;
- production Angular application build and Chromium interaction;
- no Angular dependency in any VyrnForge package.

The fixture intentionally does not use Angular Forms. CF-7004 determines whether
a thin reactive/template-driven forms adapter is necessary after this native
form-association evidence.

Angular 22.0.x is isolated from the repository workspace because it requires
TypeScript 6.0.x while the VyrnForge workspace currently uses TypeScript 7.
