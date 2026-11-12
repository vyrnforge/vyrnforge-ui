import { Cluster, Container, ControlGroup, Grid, Stack, type ClusterProps, type ContainerProps, type ControlGroupProps, type GridProps, type LayoutSpace, type StackProps } from '@vyrnforge/vue/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', gap, align: 'start', justify: 'space-between' };
const clusterProps: ClusterProps = { as: 'div', gap: 'sm', align: 'center', justify: 'start' };
const gridProps: GridProps = { as: 'section', gap: 'md' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md' };
const controlGroupProps: ControlGroupProps = { orientation: 'vertical' };
const stack: typeof Stack = Stack;
const cluster: typeof Cluster = Cluster;
const grid: typeof Grid = Grid;
const container: typeof Container = Container;
const controlGroup: typeof ControlGroup = ControlGroup;
void [stackProps, clusterProps, gridProps, containerProps, controlGroupProps, stack, cluster, grid, container, controlGroup];
