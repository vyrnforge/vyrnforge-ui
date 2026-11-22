import { createRoot } from 'react-dom/client';
import { Image } from '@vyrnforge/react/image';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/image.css';

function App() {
  return (
    <figure>
      <Image
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='160' viewBox='0 0 320 160'%3E%3Crect width='320' height='160' fill='%23eef1f4'/%3E%3Ccircle cx='160' cy='80' r='52' fill='%235e8cad'/%3E%3C/svg%3E"
        alt="A blue circle centered on a pale background"
        width={320}
        height={160}
      />
      <Text as="figcaption" variant="caption">Study of shape and contrast</Text>
    </figure>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
