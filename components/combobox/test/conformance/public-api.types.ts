type ReactModule = typeof import('@vyrnforge/react/combobox');
type AngularModule = typeof import('@vyrnforge/angular/combobox');
type VueModule = typeof import('@vyrnforge/vue/combobox');
type ElementsModule = typeof import('@vyrnforge/elements/combobox');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
