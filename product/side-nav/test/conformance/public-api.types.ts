type ReactModule = typeof import('@vyrnforge/react/side-nav');
type AngularModule = typeof import('@vyrnforge/angular/side-nav');
type VueModule = typeof import('@vyrnforge/vue/side-nav');
type ElementsModule = typeof import('@vyrnforge/elements/side-nav');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
