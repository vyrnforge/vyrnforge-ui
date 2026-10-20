import type {
  TabsActivation,
  TabsListProps,
  TabsOrientation,
  TabsPanelProps,
  TabsRootProps,
  TabsTabProps,
} from '@vyrnforge/react/tabs';

const uncontrolled: TabsRootProps = {
  defaultValue: 'overview',
  orientation: 'horizontal',
  activation: 'automatic',
  dir: 'ltr',
  onValueChange: (value) => void value,
};
const controlled: TabsRootProps = { value: 'settings', onValueChange: (value) => void value };
const list: TabsListProps = { 'aria-label': 'Account sections' };
const tab: TabsTabProps = { value: 'overview', disabled: false, children: 'Overview' };
const panel: TabsPanelProps = { value: 'overview', children: 'Overview panel' };
const orientations: TabsOrientation[] = ['horizontal', 'vertical'];
const activations: TabsActivation[] = ['automatic', 'manual'];
// @ts-expect-error Uncontrolled Tabs requires an explicit initial value for SSR-complete output.
const missingInitial: TabsRootProps = {};
// @ts-expect-error Unsupported activation models are not public API.
const invalidActivation: TabsActivation = 'focus-only';
void [uncontrolled, controlled, list, tab, panel, orientations, activations, missingInitial, invalidActivation];
