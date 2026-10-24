type ReactModule = typeof import('@vyrnforge/react/search-field');
type AngularModule = typeof import('@vyrnforge/angular/search-field');
type VueModule = typeof import('@vyrnforge/vue/search-field');
type ElementsModule = typeof import('@vyrnforge/elements/search-field');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
