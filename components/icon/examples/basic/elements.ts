import { VfIconElement, defineIconElement } from '@vyrnforge/elements/icon';
import { bookmarkIcon } from '@vyrnforge/web/icon';
defineIconElement();
const icon = document.querySelector('vf-icon') as VfIconElement;
icon.icon = bookmarkIcon;
icon.variant = 'outlined';
icon.shape = 'rounded';
icon.label = 'Bookmark';
