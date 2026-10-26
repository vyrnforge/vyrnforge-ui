type ReactModule = typeof import('@vyrnforge/react/popover');
type AngularModule = typeof import('@vyrnforge/angular/popover');
type VueModule = typeof import('@vyrnforge/vue/popover');
type ElementsModule = typeof import('@vyrnforge/elements/popover');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
