type ReactModule = typeof import('@vyrnforge/react/menubar');
type AngularModule = typeof import('@vyrnforge/angular/menubar');
type VueModule = typeof import('@vyrnforge/vue/menubar');
type ElementsModule = typeof import('@vyrnforge/elements/menubar');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
