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
} from '@vyrnforge/react/layout';
import { createRef } from 'react';

const gap: LayoutSpace = 'lg';
const stackProps: StackProps<'section'> = { as: 'section', gap, align: 'start', justify: 'start', id: 'content-stack' };
const formStackProps: StackProps<'form'> = { as: 'form', gap: 'md', action: '/save', method: 'post' };
const inlineProps: InlineProps = { gap: 'sm', align: 'baseline', justify: 'space-between', id: 'inline-row' };
const clusterProps: ClusterProps = { gap: 'sm', align: 'center', justify: 'start', id: 'actions' };
const autoGridProps: AutoGridProps<'section'> = { as: 'section', gap: 'md', id: 'cards' };
const containerProps: ContainerProps<'main'> = { as: 'main', size: 'lg', gutter: 'md', id: 'page-container' };
const controlGroupProps: ControlGroupProps<'fieldset'> = { as: 'fieldset', orientation: 'vertical', 'aria-label': 'Actions' };

// Exercise the actual public generic component signature, not only Props aliases.
const formRef = createRef<HTMLFormElement>();
const listRef = createRef<HTMLUListElement>();
const fieldsetRef = createRef<HTMLFieldSetElement>();
const formHost = Stack({ as: 'form', action: '/save', method: 'post', ref: formRef });
const listHost = Cluster({ as: 'ul', ref: listRef, gap: 'sm' });
const fieldsetHost = ControlGroup({ as: 'fieldset', ref: fieldsetRef, disabled: true });
const navHost = Inline({ as: 'nav', 'aria-label': 'Primary', ref: createRef<HTMLElement>() });

// @ts-expect-error a native button is not an admitted layout host.
const invalidHost = AutoGrid({ as: 'button' });
// @ts-expect-error form-only native action props cannot be passed to a div.
const invalidHostAttribute = Stack({ as: 'div', action: '/save' });
// @ts-expect-error the ref must belong to the selected native form element.
const invalidHostRef = Stack({ as: 'form', ref: createRef<HTMLDivElement>() });


const stack: typeof Stack = Stack;
const inline: typeof Inline = Inline;
const cluster: typeof Cluster = Cluster;
const autoGrid: typeof AutoGrid = AutoGrid;
const container: typeof Container = Container;
const controlGroup: typeof ControlGroup = ControlGroup;

// @ts-expect-error AutoGrid does not expose arbitrary track sizing as a prop.
const invalidAutoGridProps: AutoGridProps = { minItemSize: '12rem' };
// @ts-expect-error Stack no longer owns inline flow.
const invalidStackProps: StackProps = { direction: 'inline' };
// @ts-expect-error unknown spacing values are not part of the layout contract.
const invalidGap: LayoutSpace = 'huge';

void [
  stackProps, formStackProps, inlineProps, clusterProps, autoGridProps, containerProps, controlGroupProps,
  formRef, listRef, fieldsetRef, formHost, listHost, fieldsetHost, navHost, invalidHost, invalidHostAttribute, invalidHostRef,
  stack, inline, cluster, autoGrid, container, controlGroup, invalidAutoGridProps, invalidStackProps, invalidGap,
];
