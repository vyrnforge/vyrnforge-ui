import { createElement, createRef } from 'react';
import { Backdrop } from '@vyrnforge/react/backdrop';
void createElement(Backdrop, { ref: createRef<HTMLDivElement>(), hidden: true, style: { opacity: 0.5 } });
// @ts-expect-error decorative scrim has no children
void createElement(Backdrop, { children: 'hidden message' });
// @ts-expect-error scrim is not an interaction target
void createElement(Backdrop, { onClick() {} });
