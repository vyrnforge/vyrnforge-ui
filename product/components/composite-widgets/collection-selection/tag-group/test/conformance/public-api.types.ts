type ReactModule = typeof import('@vyrnforge/react/tag-group');
type AngularModule = typeof import('@vyrnforge/angular/tag-group');
type VueModule = typeof import('@vyrnforge/vue/tag-group');
type ElementsModule = typeof import('@vyrnforge/elements/tag-group');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
