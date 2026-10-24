type ReactModule = typeof import('@vyrnforge/react/toolbar');
type AngularModule = typeof import('@vyrnforge/angular/toolbar');
type VueModule = typeof import('@vyrnforge/vue/toolbar');
type ElementsModule = typeof import('@vyrnforge/elements/toolbar');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
