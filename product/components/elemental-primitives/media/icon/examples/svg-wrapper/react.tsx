import { createRoot } from 'react-dom/client';
import { createSvgIcon, Flow, Text } from '@vyrnforge/react';

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
    <Flow gap="sm">
      <Text as="p"><SparkleIcon /> Default</Text>
      <Text as="p" style={{ color: 'var(--vf-color-accent-background)' }}>
        <SparkleIcon size="lg" /> Accent
      </Text>
      <Text as="p"><SparkleIcon size="lg" label="Sparkle" /> Named</Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
