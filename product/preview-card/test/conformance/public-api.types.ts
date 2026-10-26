type ReactModule = typeof import('@vyrnforge/react/preview-card');
type AngularModule = typeof import('@vyrnforge/angular/preview-card');
type VueModule = typeof import('@vyrnforge/vue/preview-card');
type ElementsModule = typeof import('@vyrnforge/elements/preview-card');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
