import { createRoot } from 'react-dom/client';
import { Avatar } from '@vyrnforge/react/avatar';
import '@vyrnforge/web/styles/avatar.css';

function App() {
  return <Avatar name="Alex Chen" initials="AC" src="/_vyrnforge_missing_avatar.webp" size="lg" />;
}
createRoot(document.querySelector('#root')!).render(<App />);
