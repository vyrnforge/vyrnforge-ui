import type {
  TabsActivation,
  TabsListProps,
  TabsOrientation,
  TabsPanelProps,
  TabsRootProps,
  TabsTabProps,
} from '@vyrnforge/vue/tabs';

const root: TabsRootProps = {
  defaultValue: 'overview',
  orientation: 'vertical',
  activation: 'manual',
  dir: 'rtl',
};
const list: TabsListProps = { 'aria-label': 'Sections' };
const tab: TabsTabProps = { value: 'overview', disabled: false };
const panel: TabsPanelProps = { value: 'overview' };
const orientations: TabsOrientation[] = ['horizontal', 'vertical'];
const activations: TabsActivation[] = ['automatic', 'manual'];
// @ts-expect-error Unsupported orientation.
const invalidOrientation: TabsOrientation = 'diagonal';
void [root, list, tab, panel, orientations, activations, invalidOrientation];
