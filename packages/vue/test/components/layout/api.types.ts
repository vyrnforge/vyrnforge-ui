import {
  AutoGrid,
  Cluster,
  Container,
  ControlGroup,
  Inline,
  Stack,
  type AutoGridProps,
  type ClusterProps,
  type ContainerProps,
  type ControlGroupProps,
  type InlineProps,
  type LayoutSpace,
  type StackProps,
} from '@vyrnforge/vue/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', gap, align: 'start', justify: 'space-between' };
const inlineProps: InlineProps = { as: 'div', gap: 'sm', align: 'baseline', justify: 'space-between' };
const clusterProps: ClusterProps = { as: 'div', gap: 'sm', align: 'center', justify: 'start' };
const autoGridProps: AutoGridProps = { as: 'section', gap: 'md' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md' };
const controlGroupProps: ControlGroupProps = { as: 'fieldset', orientation: 'vertical' };

const stack: typeof Stack = Stack;
const inline: typeof Inline = Inline;
const cluster: typeof Cluster = Cluster;
const autoGrid: typeof AutoGrid = AutoGrid;
const container: typeof Container = Container;
const controlGroup: typeof ControlGroup = ControlGroup;

void [stackProps, inlineProps, clusterProps, autoGridProps, containerProps, controlGroupProps, stack, inline, cluster, autoGrid, container, controlGroup];
