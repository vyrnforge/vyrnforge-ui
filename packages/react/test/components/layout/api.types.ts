import { Cluster, Container, Stack, type ClusterProps, type ContainerProps, type LayoutSpace, type StackProps } from '@vyrnforge/react/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', gap, align: 'start', justify: 'start', id: 'content-stack' };
const clusterProps: ClusterProps = { as: 'div', gap: 'sm', align: 'center', justify: 'start', id: 'actions' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md', id: 'page-container' };
const stack: typeof Stack = Stack;
const cluster: typeof Cluster = Cluster;
const container: typeof Container = Container;
// @ts-expect-error Stack no longer owns inline flow.
const invalidStackProps: StackProps = { direction: 'inline' };
// @ts-expect-error unknown spacing values are not part of the layout contract.
const invalidGap: LayoutSpace = 'huge';
void [stackProps, clusterProps, containerProps, stack, cluster, container, invalidStackProps, invalidGap];
