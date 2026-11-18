type ReactModule = typeof import('@vyrnforge/react/accordion');
type AngularModule = typeof import('@vyrnforge/angular/accordion');
type VueModule = typeof import('@vyrnforge/vue/accordion');
type ElementsModule = typeof import('@vyrnforge/elements/accordion');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;

// Intentional QA-only negative control; this type must not exist.
type MustRejectUnknownAccordionExport = import('@vyrnforge/react/accordion').NoSuchPublicType;
void (null as unknown as MustRejectUnknownAccordionExport);
