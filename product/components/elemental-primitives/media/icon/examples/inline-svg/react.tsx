import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/icon.css';

// Native JSX SVG markup is not the VyrnForge <Icon icon={definition} /> API.
function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="lg" align="center">
      <Flow direction="inline" gap="sm" align="center">
        <svg data-vf-icon="" data-vf-size="lg" viewBox="0 0 24 24"
          role="img" aria-label="Sparkle" focusable="false">
          <path d="M12 2 14.8 9.2 22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"
            fill="none" stroke="currentColor" strokeWidth="1.75"
            strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2" fill="var(--vf-color-accent-background)" />
        </svg>
        <span>Named SVG</span>
      </Flow>
      <Flow direction="inline" gap="sm" align="center">
        <svg data-vf-icon="" data-vf-size="md" viewBox="0 0 24 24"
          aria-hidden="true" focusable="false">
          <rect x="4" y="4" width="16" height="16" rx="3"
            fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" />
        </svg>
        <span>Decorative SVG</span>
      </Flow>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
