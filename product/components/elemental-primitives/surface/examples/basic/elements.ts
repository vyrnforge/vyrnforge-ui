import { defineSurfaceElement } from '@vyrnforge/elements/surface';
import '@vyrnforge/web/styles/surface.css';

defineSurfaceElement();

document.body.innerHTML = `
  <vf-surface>
    <h2>Release summary</h2>
    <p>Surface supplies the visual boundary; application CSS owns spacing and layout.</p>
  </vf-surface>
`;
