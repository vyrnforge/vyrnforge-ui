import { Cluster, Container, Stack, type ClusterProps, type ContainerProps, type LayoutSpace, type StackProps } from '@vyrnforge/vue/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', gap, align: 'start', justify: 'space-between' };
const clusterProps: ClusterProps = { as: 'div', gap: 'sm', align: 'center', justify: 'start' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md' };
const stack: typeof Stack = Stack;
const cluster: typeof Cluster = Cluster;
const container: typeof Container = Container;
void [stackProps, clusterProps, containerProps, stack, cluster, container];
