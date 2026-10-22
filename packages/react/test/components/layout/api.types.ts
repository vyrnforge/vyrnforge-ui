import { Cluster, Container, Grid, Stack, type ClusterProps, type ContainerProps, type GridProps, type LayoutSpace, type StackProps } from '@vyrnforge/react/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', gap, align: 'start', justify: 'start', id: 'content-stack' };
const clusterProps: ClusterProps = { as: 'div', gap: 'sm', align: 'center', justify: 'start', id: 'actions' };
const gridProps: GridProps = { as: 'section', gap: 'md', id: 'cards' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md', id: 'page-container' };
const stack: typeof Stack = Stack;
const cluster: typeof Cluster = Cluster;
const grid: typeof Grid = Grid;
const container: typeof Container = Container;
// @ts-expect-error Grid does not expose arbitrary track sizing as a prop.
const invalidGridProps: GridProps = { minItemSize: '12rem' };
// @ts-expect-error Stack no longer owns inline flow.
const invalidStackProps: StackProps = { direction: 'inline' };
// @ts-expect-error unknown spacing values are not part of the layout contract.
const invalidGap: LayoutSpace = 'huge';
void [stackProps, clusterProps, gridProps, containerProps, stack, cluster, grid, container, invalidGridProps, invalidStackProps, invalidGap];
