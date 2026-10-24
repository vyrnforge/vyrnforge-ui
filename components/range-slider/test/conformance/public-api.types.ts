type ReactModule = typeof import('@vyrnforge/react/range-slider');
type AngularModule = typeof import('@vyrnforge/angular/range-slider');
type VueModule = typeof import('@vyrnforge/vue/range-slider');
type ElementsModule = typeof import('@vyrnforge/elements/range-slider');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
