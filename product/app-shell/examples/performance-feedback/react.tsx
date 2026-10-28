import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain } from '@vyrnforge/react/app-shell';
import { Button } from '@vyrnforge/react/button';
import { Textarea } from '@vyrnforge/react/textarea';
import '@vyrnforge/web/styles/app-shell.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/textarea.css';
import './example.css';

const PAGE_SIZE = 50;
const records = Array.from({ length: 2000 }, (_, index) => ({
  id: index + 1,
  name: `Record ${String(index + 1).padStart(4, '0')}`,
  status: index % 7 === 0 ? 'Needs review' : 'Ready',
}));

function measure(name: string, start: string, end: string) {
  performance.mark(end);
  performance.measure(name, start, end);
  return performance.getEntriesByName(name).at(-1)?.duration ?? 0;
}

function App() {
  const [page, setPage] = React.useState(0);
  const [note, setNote] = React.useState('Review the selected records before saving.');
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [detailState, setDetailState] = React.useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [detail, setDetail] = React.useState('Optional detail has not been loaded.');
  const [lastMeasurement, setLastMeasurement] = React.useState('Measurements are diagnostics; this example has no hard millisecond gate.');

  React.useLayoutEffect(() => {
    performance.mark('vf-list-render-end');
    const start = performance.getEntriesByName('vf-list-render-start').at(-1);
    if (start) {
      const duration = measure('vf-list-render', 'vf-list-render-start', 'vf-list-render-end');
      setLastMeasurement(`Rendered page ${page + 1} in ${duration.toFixed(2)} ms in this browser run.`);
    }
  }, [page]);

  const visibleRecords = records.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pageCount = Math.ceil(records.length / PAGE_SIZE);

  function changePage(nextPage: number) {
    performance.mark('vf-list-render-start');
    setPage(nextPage);
  }

  async function save() {
    setSaveState('saving');
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    setSaveState('saved');
  }

  async function loadDetail() {
    setDetailState('loading');
    try {
      const module = await import('./lazy-detail');
      setDetail(module.loadDetailSummary());
      setDetailState('ready');
    } catch {
      setDetail('Deferred detail could not be loaded. The primary list task remains available.');
      setDetailState('failed');
    }
  }

  return (
    <AppShell>
      <AppShellHeader><strong>Performance UX evidence</strong></AppShellHeader>
      <AppShellBody>
        <AppShellMain className="perf-main">
          <header className="perf-heading">
            <div>
              <h1>Measured performance without fake certainty</h1>
              <p>This bounded example records browser measurements as diagnostics while preserving truthful task state and recovery.</p>
            </div>
            <span className="perf-badge">2,000 records · 50 per page</span>
          </header>

          <section className="perf-panel" aria-labelledby="large-data-heading">
            <div className="perf-section-heading">
              <div>
                <h2 id="large-data-heading">Large collection</h2>
                <p id="list-status" role="status">Showing records {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, records.length)} of {records.length}. {lastMeasurement}</p>
              </div>
              <div className="perf-actions" aria-label="Pagination">
                <Button type="button" variant="secondary" disabled={page === 0} onClick={() => changePage(page - 1)}>Previous page</Button>
                <Button type="button" variant="secondary" disabled={page >= pageCount - 1} onClick={() => changePage(page + 1)}>Next page</Button>
              </div>
            </div>
            <div className="perf-table-wrap">
              <table>
                <caption>Current page of the representative 2,000-record collection</caption>
                <thead><tr><th scope="col">ID</th><th scope="col">Name</th><th scope="col">Status</th></tr></thead>
                <tbody>{visibleRecords.map((record) => <tr key={record.id}><td>{record.id}</td><td>{record.name}</td><td>{record.status}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="perf-panel" aria-labelledby="save-heading">
            <h2 id="save-heading">Delayed save with truthful feedback</h2>
            <label htmlFor="performance-note">Review note</label>
            <Textarea id="performance-note" value={note} onChange={(event) => { setNote(event.currentTarget.value); setSaveState('idle'); }} />
            <div className="perf-actions">
              <Button type="button" loading={saveState === 'saving'} onClick={save} disabled={saveState === 'saving'}>Save note</Button>
              <span role="status" aria-live="polite">{saveState === 'saving' ? 'Saving note…' : saveState === 'saved' ? 'Note saved by the deterministic fake service.' : 'Changes are not saved yet.'}</span>
            </div>
          </section>

          <section className="perf-panel" aria-labelledby="lazy-heading">
            <h2 id="lazy-heading">Optional deferred capability</h2>
            <p>The primary collection is usable before this optional module is requested.</p>
            <div className="perf-actions">
              <Button type="button" variant="secondary" onClick={loadDetail} disabled={detailState === 'loading'}>{detailState === 'loading' ? 'Loading detail…' : 'Load optional detail'}</Button>
              <span role="status" aria-live="polite">{detail}</span>
            </div>
          </section>

          <section className="perf-panel" aria-labelledby="motion-heading">
            <h2 id="motion-heading">Non-essential transition</h2>
            <p>The indicator uses a short transform/opacity transition and disables that transition when reduced motion is requested.</p>
            <div className="perf-motion" data-testid="motion-indicator">Measured state change</div>
          </section>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

performance.mark('vf-list-render-start');
createRoot(document.querySelector('#root')!).render(<App />);
