import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
} from '@vyrnforge/react/alert-dialog';
import '@vyrnforge/web/styles/alert-dialog.css';

function createDeterministicDeleteService() {
  let pending: { resolve(): void; reject(error: Error): void; promise: Promise<void> } | undefined;
  let requestCount = 0;

  return {
    request() {
      requestCount += 1;
      document.body.dataset.deleteRequests = String(requestCount);
      if (pending) return pending.promise;

      let resolvePromise!: () => void;
      let rejectPromise!: (error: Error) => void;
      const promise = new Promise<void>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
      });
      pending = {
        promise,
        resolve() {
          pending = undefined;
          resolvePromise();
        },
        reject(error) {
          pending = undefined;
          rejectPromise(error);
        },
      };
      return promise;
    },
    resolve() {
      pending?.resolve();
    },
    reject() {
      pending?.reject(new Error('The collection service rejected the deletion.'));
    },
  };
}

const deleteService = createDeterministicDeleteService();
(globalThis as typeof globalThis & { __vfAlertDialogTestService?: typeof deleteService }).__vfAlertDialogTestService = deleteService;

function App() {
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<'idle' | 'pending' | 'error' | 'success'>('idle');
  const [deleted, setDeleted] = React.useState(false);
  const pending = phase === 'pending';

  async function requestDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (pending || deleted) return;
    setPhase('pending');
    try {
      await deleteService.request();
      setPhase('success');
      setDeleted(true);
      setOpen(false);
    } catch {
      setPhase('error');
    }
  }

  return (
    <main>
      <h2>Shared collection</h2>
      <p data-collection-state>{deleted ? 'Quarterly planning deleted.' : 'Quarterly planning is available.'}</p>
      <button
        type="button"
        aria-disabled={deleted}
        onClick={() => {
          if (deleted) return;
          setPhase('idle');
          setOpen(true);
        }}
      >
        {deleted ? 'Collection deleted' : 'Delete shared collection'}
      </button>

      <AlertDialogRoot
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen && phase !== 'pending') setPhase('idle');
        }}
        onDismissRequest={(request) => {
          document.body.dataset.lastDismissReason = request.reason;
          if (pending) request.preventDefault();
        }}
      >
        <AlertDialogTitle>Delete “Quarterly planning”?</AlertDialogTitle>
        <AlertDialogDescription>
          This permanently removes 14 shared items from the workspace. There is no self-service restore.
        </AlertDialogDescription>
        <AlertDialogBody>
          <p>Only continue if you intend to remove this collection for everyone who has access.</p>
          {phase === 'pending' ? <p role="status">Deleting collection…</p> : null}
          {phase === 'error' ? <p role="alert">Deletion failed. Nothing was deleted. Review the consequence and retry.</p> : null}
        </AlertDialogBody>
        <AlertDialogCancel autoFocus aria-disabled={pending}>Cancel</AlertDialogCancel>{' '}
        <AlertDialogAction aria-disabled={pending} onClick={requestDelete}>Delete collection</AlertDialogAction>
      </AlertDialogRoot>
    </main>
  );
}

document.body.dataset.deleteRequests = '0';
createRoot(document.querySelector('#root')!).render(<App />);
