type ReactModule = typeof import('@vyrnforge/react/listbox');
type AngularModule = typeof import('@vyrnforge/angular/listbox');
type VueModule = typeof import('@vyrnforge/vue/listbox');
type ElementsModule = typeof import('@vyrnforge/elements/listbox');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
