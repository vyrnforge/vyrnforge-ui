import {
  AspectRatio,
  Cluster,
  Container,
  ControlGroup,
  Field,
  Fieldset,
  Grid,
  Inline,
  RadioGroup,
  Stack,
  type AspectRatioProps,
  type ClusterProps,
  type ContainerProps,
  type ControlGroupProps,
  type FieldProps,
  type FieldsetProps,
  type GridProps,
  type InlineProps,
  type LayoutSpace,
  type RadioGroupProps,
  type StackProps,
} from '@vyrnforge/vue/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', gap, align: 'start', justify: 'space-between' };
const inlineProps: InlineProps = { as: 'div', gap: 'sm', align: 'baseline', justify: 'space-between' };
const clusterProps: ClusterProps = { as: 'div', gap: 'sm', align: 'center', justify: 'start' };
const gridProps: GridProps = { as: 'section', gap: 'md' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md' };
const aspectRatioProps: AspectRatioProps = { as: 'div', ratio: 'video' };
const fieldProps: FieldProps = { as: 'div', gap: 'xs' };
const fieldsetProps: FieldsetProps = { gap: 'sm' };
const controlGroupProps: ControlGroupProps = { orientation: 'vertical' };
const radioGroupProps: RadioGroupProps = { gap: 'sm', orientation: 'horizontal' };

const stack: typeof Stack = Stack;
const inline: typeof Inline = Inline;
const cluster: typeof Cluster = Cluster;
const grid: typeof Grid = Grid;
const container: typeof Container = Container;
const aspectRatio: typeof AspectRatio = AspectRatio;
const field: typeof Field = Field;
const fieldset: typeof Fieldset = Fieldset;
const controlGroup: typeof ControlGroup = ControlGroup;
const radioGroup: typeof RadioGroup = RadioGroup;

void [
  stackProps, inlineProps, clusterProps, gridProps, containerProps, aspectRatioProps, fieldProps, fieldsetProps,
  controlGroupProps, radioGroupProps, stack, inline, cluster, grid, container, aspectRatio, field, fieldset,
  controlGroup, radioGroup,
];
