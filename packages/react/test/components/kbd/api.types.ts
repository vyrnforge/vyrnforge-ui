import type { Ref } from 'react';
import type { KbdProps } from '@vyrnforge/react/kbd';
import { Kbd } from '@vyrnforge/react/kbd';

const key: KbdProps = { title: 'Enter', 'aria-label': 'Enter key', variant: 'body-sm' };
const ref: Ref<HTMLElement> | undefined = undefined;
const render = Kbd;

// @ts-expect-error only canonical typography roles are supported
const badVariant: KbdProps = { variant: 'shortcut' };
// @ts-expect-error Kbd is non-interactive and has no loading property
const badLoading: KbdProps = { loading: true };
void [key, ref, render, badVariant, badLoading];
