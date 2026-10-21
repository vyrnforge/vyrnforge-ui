import { Container, Stack, type ContainerProps, type LayoutSpace, type StackProps } from '@vyrnforge/vue/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', direction: 'inline', gap, align: 'center', justify: 'space-between' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md' };
const stack: typeof Stack = Stack;
const container: typeof Container = Container;
void [stackProps, containerProps, stack, container];
