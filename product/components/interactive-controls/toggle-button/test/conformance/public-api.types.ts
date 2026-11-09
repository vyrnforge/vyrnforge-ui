type ReactControl = typeof import('@vyrnforge/react/toggle-button').ToggleButton;
type AngularControl = typeof import('@vyrnforge/angular/toggle-button').VfToggleButtonDirective;
type VueControl = typeof import('@vyrnforge/vue/toggle-button').ToggleButton;
type WebConnector = typeof import('@vyrnforge/web/toggle-button').connectToggleButton;
const values: [ReactControl | undefined, AngularControl | undefined, VueControl | undefined, WebConnector | undefined] = [undefined, undefined, undefined, undefined];
void values;
