import { createRoot } from 'react-dom/client';
import { Image } from '@vyrnforge/react/image';
import '@vyrnforge/web/styles/image.css';

function App() {
  return (
    <Image
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='160' viewBox='0 0 320 160'%3E%3Crect width='320' height='160' fill='%23dce5e8'/%3E%3Ccircle cx='260' cy='40' r='28' fill='%23acbbc2'/%3E%3Cpath d='M0 130 100 65 205 135 320 85V160H0Z' fill='%237795a1'/%3E%3C/svg%3E"
      alt=""
      width={320}
      height={160}
      loading="lazy"
    />
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
