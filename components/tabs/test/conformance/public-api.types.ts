import type { TabsActivation as ReactActivation, TabsOrientation as ReactOrientation } from '@vyrnforge/react/tabs';
import type { TabsActivation as AngularActivation, TabsOrientation as AngularOrientation } from '@vyrnforge/angular/tabs';
import type { TabsActivation as VueActivation, TabsOrientation as VueOrientation } from '@vyrnforge/vue/tabs';

const orientations: [ReactOrientation, AngularOrientation, VueOrientation] = ['horizontal', 'vertical', 'horizontal'];
const activations: [ReactActivation, AngularActivation, VueActivation] = ['automatic', 'manual', 'automatic'];
void [orientations, activations];
