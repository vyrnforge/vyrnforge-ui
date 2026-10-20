import { Container, Stack, type ContainerProps, type LayoutSpace, type StackProps } from '@vyrnforge/react/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', direction: 'block', gap, align: 'start', justify: 'start', id: 'content-stack' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md', id: 'page-container' };
const stack: typeof Stack = Stack;
const container: typeof Container = Container;
// @ts-expect-error unknown spacing values are not part of the layout contract.
const invalidGap: LayoutSpace = 'huge';
void [stackProps, containerProps, stack, container, invalidGap];
