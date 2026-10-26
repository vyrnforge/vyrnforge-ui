type ReactModule = typeof import('@vyrnforge/react/color-picker');
type AngularModule = typeof import('@vyrnforge/angular/color-picker');
type VueModule = typeof import('@vyrnforge/vue/color-picker');
type ElementsModule = typeof import('@vyrnforge/elements/color-picker');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
