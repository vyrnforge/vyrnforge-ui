type ReactModule = typeof import('@vyrnforge/react/segmented-control');
type AngularModule = typeof import('@vyrnforge/angular/segmented-control');
type VueModule = typeof import('@vyrnforge/vue/segmented-control');
type ElementsModule = typeof import('@vyrnforge/elements/segmented-control');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
