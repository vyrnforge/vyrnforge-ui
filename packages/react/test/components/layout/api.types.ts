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
} from '@vyrnforge/react/layout';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps = { as: 'section', gap, align: 'start', justify: 'start', id: 'content-stack' };
const inlineProps: InlineProps = { as: 'div', gap: 'sm', align: 'baseline', justify: 'space-between', id: 'inline-row' };
const clusterProps: ClusterProps = { as: 'div', gap: 'sm', align: 'center', justify: 'start', id: 'actions' };
const gridProps: GridProps = { as: 'section', gap: 'md', id: 'cards' };
const containerProps: ContainerProps = { as: 'main', size: 'lg', gutter: 'md', id: 'page-container' };
const aspectRatioProps: AspectRatioProps = { as: 'div', ratio: 'video', id: 'media-frame' };
const fieldProps: FieldProps = { as: 'div', gap: 'xs', id: 'email-field' };
const fieldsetProps: FieldsetProps = { gap: 'sm', disabled: true, name: 'profile' };
const controlGroupProps: ControlGroupProps = { orientation: 'vertical', 'aria-label': 'Actions' };
const radioGroupProps: RadioGroupProps = { gap: 'sm', orientation: 'horizontal', name: 'plan-options' };

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

// @ts-expect-error Grid does not expose arbitrary track sizing as a prop.
const invalidGridProps: GridProps = { minItemSize: '12rem' };
// @ts-expect-error Stack no longer owns inline flow.
const invalidStackProps: StackProps = { direction: 'inline' };
// @ts-expect-error unknown spacing values are not part of the layout contract.
const invalidGap: LayoutSpace = 'huge';

void [
  stackProps, inlineProps, clusterProps, gridProps, containerProps, aspectRatioProps, fieldProps, fieldsetProps,
  controlGroupProps, radioGroupProps, stack, inline, cluster, grid, container, aspectRatio, field, fieldset,
  controlGroup, radioGroup, invalidGridProps, invalidStackProps, invalidGap,
];
