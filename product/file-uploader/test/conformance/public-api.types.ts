type ReactModule = typeof import('@vyrnforge/react/file-uploader');
type AngularModule = typeof import('@vyrnforge/angular/file-uploader');
type VueModule = typeof import('@vyrnforge/vue/file-uploader');
type ElementsModule = typeof import('@vyrnforge/elements/file-uploader');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;
