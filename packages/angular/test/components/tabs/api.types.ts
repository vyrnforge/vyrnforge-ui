import type { TabsActivation, TabsOrientation } from '@vyrnforge/angular/tabs';
import {
  VfTabsListDirective,
  VfTabsPanelDirective,
  VfTabsRootDirective,
  VfTabsTabDirective,
} from '@vyrnforge/angular/tabs';

const orientations: TabsOrientation[] = ['horizontal', 'vertical'];
const activations: TabsActivation[] = ['automatic', 'manual'];
const directives = [VfTabsRootDirective, VfTabsListDirective, VfTabsTabDirective, VfTabsPanelDirective];
// @ts-expect-error Unsupported orientation.
const invalidOrientation: TabsOrientation = 'diagonal';
void [orientations, activations, directives, invalidOrientation];
