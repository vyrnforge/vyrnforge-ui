type ReactModule = typeof import('@vyrnforge/react/rating');
type AngularModule = typeof import('@vyrnforge/angular/rating');
type VueModule = typeof import('@vyrnforge/vue/rating');
type ElementsModule = typeof import('@vyrnforge/elements/rating');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
