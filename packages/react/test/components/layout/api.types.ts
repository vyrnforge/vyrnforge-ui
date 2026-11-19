import type { Ref } from 'react';
import type { AutoGridProps, FlowProps, LayoutElement, LayoutGap, FlowAlign, FlowDirection, FlowJustify, FlowWrap } from '@vyrnforge/react/layout';
import { AutoGrid, Flow } from '@vyrnforge/react/layout';

const element: LayoutElement = 'nav';
const gap: LayoutGap = 'xl';
const direction: FlowDirection = 'inline';
const wrap: FlowWrap = 'wrap';
const align: FlowAlign = 'baseline';
const justify: FlowJustify = 'space-between';

const nav: FlowProps<'nav'> = { as: 'nav', direction, wrap, gap, align, justify, 'aria-label': 'Actions' };
const form: FlowProps<'form'> = { as: 'form', onSubmit: (event) => event.preventDefault() };
const label: FlowProps<'label'> = { as: 'label', htmlFor: 'email' };
const list: AutoGridProps<'ul'> = { as: 'ul', gap: 'lg', minItemSize: '12rem', role: 'list' };
const main: AutoGridProps<'main'> = { as: 'main', id: 'dashboard', style: { marginInline: 'auto' } };
const navRef: Ref<HTMLElement> | undefined = undefined;
const renderFlow = Flow;
const renderGrid = AutoGrid;

// @ts-expect-error cannot turn a CSS recipe into a Button
const unsupportedHost: FlowProps<'button'> = { as: 'button' };
// @ts-expect-error old Stack is not an admitted layout host
const invalidTag: LayoutElement = 'vf-stack';
// @ts-expect-error spacing names follow the canonical tokens
const badGap: LayoutGap = 'tiny';
// @ts-expect-error wrapping must be an explicit supported policy
const badWrap: FlowWrap = 'reverse';
// @ts-expect-error CSS grid minimum must be a CSS length string
const badSize: AutoGridProps = { minItemSize: 14 };
// @ts-expect-error a nav cannot accept input-specific type props
const inputType: FlowProps<'nav'> = { as: 'nav', type: 'email' };
// @ts-expect-error no generic surface variants
const unsupportedLayout: FlowProps = { columns: 3 };

void [element, nav, form, label, list, main, navRef, renderFlow, renderGrid,
  unsupportedHost, invalidTag, badGap, badWrap, badSize, inputType, unsupportedLayout];
