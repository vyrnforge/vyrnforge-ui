import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@vyrnforge/react/icon';
import { Text } from '@vyrnforge/react/text';
import { defineIcon } from '@vyrnforge/web/icon';

const productMarkIcon = defineIcon({
  name: 'product-mark',
  outlined: {
    paths: [{
      d: 'M12 4 20 12 12 20 4 12 12 4Z',
      fill: 'none', stroke: 'currentColor', strokeWidth: 1.75,
      strokeLinecap: 'round', strokeLinejoin: 'round',
    }],
  },
  filled: { paths: [{ d: 'M12 3 21 12 12 21 3 12 12 3Z', fill: 'currentColor' }] },
});

function App() {
  return <Text as="p"><Icon icon={productMarkIcon} variant="filled" label="Product mark" /> Custom product artwork.</Text>;
}

createRoot(document.querySelector('#root')!).render(<App />);
