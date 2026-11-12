import { defineLayoutElements } from '@vyrnforge/elements/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';

defineLayoutElements();

document.querySelector('#root')!.innerHTML = `
  <vf-control-group role="group" aria-label="Text alignment">
    <button data-vf-button data-vf-variant="secondary" data-vf-size="md" type="button">Left</button>
    <button data-vf-button data-vf-variant="secondary" data-vf-size="md" type="button">Center</button>
    <button data-vf-button data-vf-variant="secondary" data-vf-size="md" type="button">Right</button>
  </vf-control-group>
`;
