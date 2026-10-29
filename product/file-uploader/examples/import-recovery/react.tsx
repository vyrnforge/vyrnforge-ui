import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import {
  FileUploaderDropzone,
  FileUploaderInput,
  FileUploaderList,
  FileUploaderRoot,
} from '@vyrnforge/react/file-uploader';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/file-uploader.css';

type ImportPhase = 'idle' | 'starting' | 'transfer' | 'processing' | 'cancel-requested' | 'cancelled' | 'unknown' | 'partial' | 'failed' | 'completed';
type ImportEvent =
  | { type: 'transfer'; sent: number; total: number }
  | { type: 'processing' }
  | { type: 'cancelled' }
  | { type: 'unknown' }
  | { type: 'failed' }
  | { type: 'partial' }
  | { type: 'completed' };

type AttemptRecord = { id: number; scope: string[] };

function createDeterministicImportService() {
  let listener: ((attemptId: number, event: ImportEvent) => void) | undefined;
  let nextAttemptId = 1;
  const attempts: AttemptRecord[] = [];
  return {
    subscribe(next: (attemptId: number, event: ImportEvent) => void) {
      listener = next;
      return () => { if (listener === next) listener = undefined; };
    },
    start(scope: string[]) {
      const id = nextAttemptId++;
      attempts.push({ id, scope: [...scope] });
      document.body.dataset.importAttempts = String(attempts.length);
      document.body.dataset.lastImportScope = scope.join(',');
      return id;
    },
    emit(attemptId: number, event: ImportEvent) {
      listener?.(attemptId, event);
    },
    attempts() {
      return attempts.map((attempt) => ({ ...attempt, scope: [...attempt.scope] }));
    },
  };
}

const importService = createDeterministicImportService();
(globalThis as typeof globalThis & { __vfImportService?: typeof importService }).__vfImportService = importService;

function App() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [phase, setPhase] = React.useState<ImportPhase>('idle');
  const [attemptId, setAttemptId] = React.useState<number | null>(null);
  const [progress, setProgress] = React.useState<{ sent: number; total: number } | null>(null);
  const [message, setMessage] = React.useState('Choose a file to begin. Selection does not start an import.');
  const [partial, setPartial] = React.useState(false);
  const active = ['starting', 'transfer', 'processing', 'cancel-requested'].includes(phase);

  React.useEffect(() => importService.subscribe((id, event) => {
    setAttemptId((current) => {
      if (current !== id) return current;
      if (event.type === 'transfer') {
        setPhase('transfer');
        setProgress({ sent: event.sent, total: event.total });
        setMessage(`Transferring ${event.sent} of ${event.total} bytes.`);
      } else if (event.type === 'processing') {
        setPhase('processing');
        setProgress(null);
        setMessage('Upload complete. Processing records; completion amount is not yet known.');
      } else if (event.type === 'cancelled') {
        setPhase('cancelled');
        setMessage('Import cancelled after the service acknowledged cancellation.');
      } else if (event.type === 'unknown') {
        setPhase('unknown');
        setMessage('Import outcome is unknown. Reconcile this attempt before retrying.');
      } else if (event.type === 'failed') {
        setPhase('failed');
        setMessage('Import failed before commit. Retry is available.');
      } else if (event.type === 'partial') {
        setPhase('partial');
        setPartial(true);
        setMessage('2 records imported. 1 failed. 1 outcome is unknown.');
      } else if (event.type === 'completed') {
        setPhase('completed');
        setMessage('Import completed authoritatively.');
      }
      return current;
    });
  }), []);

  function start(scope = ['all']) {
    if (active || files.length === 0) return;
    const id = importService.start(scope);
    setAttemptId(id);
    setPhase('starting');
    setProgress(null);
    setPartial(false);
    setMessage(`Import attempt ${id} started. Waiting for measurable transfer progress.`);
  }

  function cancel() {
    if (!active || attemptId === null) return;
    setPhase('cancel-requested');
    setMessage('Cancellation requested. Waiting for authoritative outcome.');
  }

  function retry() {
    if (!['failed', 'unknown', 'partial', 'cancelled'].includes(phase)) return;
    start(partial ? ['failed-record', 'unknown-record'] : ['all']);
  }

  return (
    <main>
      <h1>Import records</h1>
      <p>This example uses a deterministic application-owned import service. VyrnForge owns file acquisition and button semantics, not transport or job orchestration.</p>
      <FileUploaderRoot onFilesChange={(next) => { setFiles(next); setPhase('idle'); setMessage(`${next.length} file selected. Import has not started.`); }}>
        <FileUploaderDropzone>Choose or drop a file</FileUploaderDropzone>
        <FileUploaderInput id="import-file" aria-label="Choose import file" />
        <FileUploaderList aria-label="Selected files" />
      </FileUploaderRoot>

      <div>
        <Button type="button" loading={active} onClick={() => start()}>Import</Button>{' '}
        <Button type="button" variant="secondary" onClick={cancel}>Cancel import</Button>{' '}
        <Button type="button" variant="secondary" onClick={retry}>Retry unresolved</Button>
      </div>

      <section aria-labelledby="import-status-heading">
        <h2 id="import-status-heading">Import status</h2>
        <p role="status">{message}</p>
        {phase === 'starting' || phase === 'processing' || phase === 'cancel-requested' ? <progress aria-label="Import progress" /> : null}
        {phase === 'transfer' && progress ? <progress aria-label="Import progress" value={progress.sent} max={progress.total} /> : null}
        {partial ? (
          <ul aria-label="Import results">
            <li>Atlas: imported</li>
            <li>Beacon: imported</li>
            <li>Cedar: failed — invalid owner reference</li>
            <li>Delta: outcome unknown — reconcile before retry</li>
          </ul>
        ) : null}
      </section>
    </main>
  );
}

document.body.dataset.importAttempts = '0';
createRoot(document.querySelector('#root')!).render(<App />);
