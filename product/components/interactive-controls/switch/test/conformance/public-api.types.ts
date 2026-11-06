type R = typeof import('@vyrnforge/react/switch').Switch;
type A = typeof import('@vyrnforge/angular/switch').VfSwitchDirective;
type V = typeof import('@vyrnforge/vue/switch').Switch;
const values: [R|undefined,A|undefined,V|undefined] = [undefined,undefined,undefined];
void values;
