import { createRoot } from 'react-dom/client';
import { createSvgIcon } from '@vyrnforge/react/icon';

// Define once with one VyrnForge import; use with built-in size, color and naming.
const SparkleIcon = createSvgIcon(
  <path
    d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z"
    fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinejoin="round"
  />
);

function App() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center',
      gap: 'var(--vf-space-lg)' }}>
      <span><SparkleIcon /> Default</span>
      <span style={{ color: 'var(--vf-color-accent-background)' }}>
        <SparkleIcon size="lg" /> Accent
      </span>
      <span><SparkleIcon size="lg" label="Sparkle" /> Named</span>
    </div>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
