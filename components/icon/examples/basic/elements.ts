import { VfIconElement, defineIconElement } from '@vyrnforge/elements/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

defineIconElement();
document.querySelector('#root')!.innerHTML = '<vf-icon id="example-icon" label="Bookmark"></vf-icon>';
const icon = document.querySelector('#example-icon') as VfIconElement;
icon.icon = bookmarkIcon;
icon.variant = 'outlined';
icon.shape = 'rounded';
