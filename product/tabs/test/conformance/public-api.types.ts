import type { TabsActivation as ReactActivation, TabsOrientation as ReactOrientation } from '@vyrnforge/react/tabs';
import type { TabsActivation as AngularActivation, TabsOrientation as AngularOrientation } from '@vyrnforge/angular/tabs';
import type { TabsActivation as VueActivation, TabsOrientation as VueOrientation } from '@vyrnforge/vue/tabs';
import type { TabsActivation as ElementsActivation, TabsOrientation as ElementsOrientation } from '@vyrnforge/elements/tabs';

const orientations: [ReactOrientation, AngularOrientation, VueOrientation, ElementsOrientation] = ['horizontal', 'vertical', 'horizontal', 'vertical'];
const activations: [ReactActivation, AngularActivation, VueActivation, ElementsActivation] = ['automatic', 'manual', 'automatic', 'manual'];
void [orientations, activations];
