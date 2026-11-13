import '@vyrnforge/web/styles/input.css';

document.body.innerHTML = `
  <label for="quantity">Quantity</label>
  <input id="quantity" data-vf-input type="number" name="quantity" min="0" step="1">

  <label for="starts-on">Starts on</label>
  <input id="starts-on" data-vf-input type="date" name="startsOn">

  <label for="accent">Accent color</label>
  <input id="accent" data-vf-input type="color" name="accent" value="#245edb">
`;
