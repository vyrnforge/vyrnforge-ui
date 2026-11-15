type ReactModule = typeof import('@vyrnforge/react/select');
type AngularModule = typeof import('@vyrnforge/angular/select');
type VueModule = typeof import('@vyrnforge/vue/select');
type ElementsModule = typeof import('@vyrnforge/elements/select');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
