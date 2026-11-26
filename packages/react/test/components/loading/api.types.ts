import { createElement, createRef } from 'react';
import { Loading, LoadingIndicator, LoadingPlaceholder, LoadingProgress, LoadingCustom } from '@vyrnforge/react/loading';
import type { LoadingSize, LoadingVariant, LoadingPlaceholderShape } from '@vyrnforge/react/loading';
const size: LoadingSize = 'sm';
const variant: LoadingVariant = 'dots';
const shape: LoadingPlaceholderShape = 'circle';
void createElement(Loading, { size, 'aria-busy': true });
void createElement(LoadingIndicator, { variant });
void createElement(LoadingPlaceholder, { shape });
void createElement(LoadingProgress, { value: 4, max: 8, ref: createRef<HTMLProgressElement>(), 'aria-label': 'Uploading' });
void createElement(LoadingCustom, null, 'Custom');
// @ts-expect-error Progress must use numeric values
void createElement(LoadingProgress, { value: 'unknown' });
// @ts-expect-error decorative placeholders cannot contain children
void createElement(LoadingPlaceholder, { children: 'Hidden content' });
// @ts-expect-error invalid built-in variant
void createElement(LoadingIndicator, { variant: 'unknown' });
