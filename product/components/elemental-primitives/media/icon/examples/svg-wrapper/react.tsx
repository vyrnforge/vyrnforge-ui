import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { SvgIcon, type SvgIconProps } from '@vyrnforge/react/icon';

// One reusable component. No name, definition object, or SVG boilerplate.
function SparkleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z"
        fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

function App() {
  return (
    <Flow direction="inline" gap="lg" wrap="wrap" align="center">
      <Flow direction="inline" gap="xs" align="center">
        <SparkleIcon />
        <span>Default</span>
      </Flow>
      <Flow direction="inline" gap="xs" align="center"
        style={{ color: 'var(--vf-color-accent-background)' }}>
        <SparkleIcon size="lg" />
        <span>Accent</span>
      </Flow>
      <Flow direction="inline" gap="xs" align="center">
        <SparkleIcon size="lg" label="Sparkle" />
        <span>Named</span>
      </Flow>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
