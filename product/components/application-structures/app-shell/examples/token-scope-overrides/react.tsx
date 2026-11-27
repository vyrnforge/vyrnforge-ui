import { Flow } from '@vyrnforge/react/layout';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles/tokens.css';
import '@vyrnforge/web/styles/foundation.css';
import '@vyrnforge/web/styles/button.css';
import './example.css';

function App() {
  return (
    <main className="token-scope-demo" data-vf-theme="light" data-vf-density="comfortable">
      <Flow>
        <section aria-label="Root light scope">
          <Button type="button">Root action</Button>
        </section>

        <section data-vf-theme="dark" aria-label="Nested dark scope">
          <Flow>
            <Button type="button">Dark action</Button>
          </Flow>
        </section>

        <section className="consumer-accent" aria-label="Consumer accent override">
          <Button type="button">Consumer accent action</Button>
        </section>

        <section className="consumer-space" aria-label="Consumer spacing override">
          <Flow gap="md">
            <Button type="button">Spacing action one</Button>
            <Button type="button">Spacing action two</Button>
          </Flow>
        </section>

        <section className="consumer-brand" aria-label="Consumer brand scope">
          <Button type="button">Brand action</Button>
        </section>

        <section data-vf-theme="system" data-vf-density="comfortable" aria-label="System appearance scope">
          <Button type="button">System action</Button>
        </section>
      </Flow>
    </main>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);