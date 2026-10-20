import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/web/icon';

function App() {
  return <Icon icon={bookmarkIcon} variant="outlined" shape="rounded" label="Bookmark" />;
}

createRoot(document.querySelector('#root')!).render(<App />);
