type ReactModule = typeof import('@vyrnforge/react/toggle-group');
type AngularModule = typeof import('@vyrnforge/angular/toggle-group');
type VueModule = typeof import('@vyrnforge/vue/toggle-group');
type ElementsModule = typeof import('@vyrnforge/elements/toggle-group');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
