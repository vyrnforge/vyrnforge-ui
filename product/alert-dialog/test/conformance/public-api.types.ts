type ReactModule = typeof import('@vyrnforge/react/alert-dialog');
type AngularModule = typeof import('@vyrnforge/angular/alert-dialog');
type VueModule = typeof import('@vyrnforge/vue/alert-dialog');
type ElementsModule = typeof import('@vyrnforge/elements/alert-dialog');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
