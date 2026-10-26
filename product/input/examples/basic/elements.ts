import '@vyrnforge/web/styles/input.css';

document.body.innerHTML = `
  <label for="email">Email</label>
  <input id="email" data-vf-input type="email" name="email" autocomplete="email" required>
`;
