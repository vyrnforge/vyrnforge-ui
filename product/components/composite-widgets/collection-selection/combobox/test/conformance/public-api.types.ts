type ReactModule = typeof import('@vyrnforge/react/combobox');
type AngularModule = typeof import('@vyrnforge/angular/combobox');
type VueModule = typeof import('@vyrnforge/vue/combobox');
type ElementsModule = typeof import('@vyrnforge/elements/combobox');
type Modules = [ReactModule, AngularModule, VueModule, ElementsModule];
declare const modules: Modules;
void modules;

const reactRootProps: import('@vyrnforge/react/combobox').ComboboxRootProps = { locale: 'tr' };
void reactRootProps;

const angularRoot = new (null as unknown as typeof import('@vyrnforge/angular/combobox').VfComboboxRootDirective)();
const angularLocale: string | undefined = angularRoot.locale();
void angularLocale;

type VueRootProps = InstanceType<typeof import('@vyrnforge/vue/combobox').ComboboxRoot>['$props'];
const vueRootProps: VueRootProps = { locale: 'tr' };
void vueRootProps;

const elementsLocaleAttribute: string = 'locale';
void elementsLocaleAttribute;
