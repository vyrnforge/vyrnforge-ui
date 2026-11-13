import { defineLayoutElements } from '@vyrnforge/elements/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/layout.css';

defineLayoutElements();

document.querySelector('#root')!.innerHTML = `
  <vf-control-group>
    <input data-vf-input type="search" aria-label="Search query">
    <button data-vf-button data-vf-variant="secondary" data-vf-size="md" type="button">Search</button>
  </vf-control-group>
`;
