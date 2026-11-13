import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/layout.css';

document.querySelector('#root')!.innerHTML = `
  <div data-vf-control-group data-vf-control-group-orientation="horizontal">
    <input data-vf-input type="search" aria-label="Search query">
    <button data-vf-button data-vf-variant="secondary" data-vf-size="md" type="button">Search</button>
  </div>
`;
