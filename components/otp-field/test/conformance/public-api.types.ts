type ReactModule = typeof import('@vyrnforge/react/otp-field');
type AngularModule = typeof import('@vyrnforge/angular/otp-field');
type VueModule = typeof import('@vyrnforge/vue/otp-field');
type ElementsModule = typeof import('@vyrnforge/elements/otp-field');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
