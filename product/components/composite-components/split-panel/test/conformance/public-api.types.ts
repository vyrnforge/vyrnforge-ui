type ReactModule = typeof import('@vyrnforge/react/split-panel');
type AngularModule = typeof import('@vyrnforge/angular/split-panel');
type VueModule = typeof import('@vyrnforge/vue/split-panel');
type ElementsModule = typeof import('@vyrnforge/elements/split-panel');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
