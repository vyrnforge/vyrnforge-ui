type ReactModule = typeof import('@vyrnforge/react/pagination');
type AngularModule = typeof import('@vyrnforge/angular/pagination');
type VueModule = typeof import('@vyrnforge/vue/pagination');
type ElementsModule = typeof import('@vyrnforge/elements/pagination');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
