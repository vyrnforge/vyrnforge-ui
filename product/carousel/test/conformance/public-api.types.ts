type ReactModule = typeof import('@vyrnforge/react/carousel');
type AngularModule = typeof import('@vyrnforge/angular/carousel');
type VueModule = typeof import('@vyrnforge/vue/carousel');
type ElementsModule = typeof import('@vyrnforge/elements/carousel');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
