type ReactModule = typeof import('@vyrnforge/react/disclosure');
type AngularModule = typeof import('@vyrnforge/angular/disclosure');
type VueModule = typeof import('@vyrnforge/vue/disclosure');
type ElementsModule = typeof import('@vyrnforge/elements/disclosure');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
