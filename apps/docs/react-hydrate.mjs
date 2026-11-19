import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ReactReferencePage } from './react-reference.mjs';

const root = document.getElementById('vf-react-root');
const payload = document.getElementById('vf-react-page-data');
if (root && payload) {
  const props = JSON.parse(payload.textContent);
  hydrateRoot(root, createElement(ReactReferencePage, props), {
    onRecoverableError(error) {
      console.error('React documentation hydration:', error);
    },
  });
}
