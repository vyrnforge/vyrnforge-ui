import { VfIconElement, defineIconElement } from '@vyrnforge/elements/icon';
import { bookmarkIcon } from '@vyrnforge/web/icon';

defineIconElement();

document.querySelector('#root')!.innerHTML = '<vf-icon></vf-icon>';

const icon = document.querySelector('vf-icon') as VfIconElement;
icon.icon = bookmarkIcon;
icon.variant = 'outlined';
icon.shape = 'rounded';
icon.label = 'Bookmark';
