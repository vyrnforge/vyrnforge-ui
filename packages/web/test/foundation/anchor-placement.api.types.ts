import type { AnchorPlacement } from '@vyrnforge/web';

const side: AnchorPlacement = 'top';
const aligned: AnchorPlacement = 'right-start';
// @ts-expect-error placement is a preferred side/alignment, not a positioning strategy.
const strategy: AnchorPlacement = 'fixed';
void [side, aligned, strategy];
