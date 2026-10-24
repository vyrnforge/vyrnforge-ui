type ReactModule = typeof import('@vyrnforge/react/toast');
type AngularModule = typeof import('@vyrnforge/angular/toast');
type VueModule = typeof import('@vyrnforge/vue/toast');
type ElementsModule = typeof import('@vyrnforge/elements/toast');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
