import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Image } from '@vyrnforge/react/image';
import '@vyrnforge/web/styles/image.css';

function App() {
  return (
    <Image
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='320' viewBox='0 0 640 320'%3E%3Crect width='640' height='320' fill='%23c4d6e8'/%3E%3Ccircle cx='495' cy='96' r='45' fill='%23f3dc91'/%3E%3Cpath d='M0 260 210 100 410 265 500 195 640 295V320H0Z' fill='%235b8071'/%3E%3C/svg%3E"
      alt="Illustration of green hills beneath a yellow sun"
      width={640}
      height={320}
      loading="lazy"
      decoding="async"
    />
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
