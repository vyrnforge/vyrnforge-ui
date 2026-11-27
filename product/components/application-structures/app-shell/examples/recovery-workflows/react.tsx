import { Text } from '@vyrnforge/react/text';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';

type SaveEvent =
  | { type: 'accepted'; value: string }
  | { type: 'rejected' }
  | { type: 'system-failure' };
type ListState = 'loading' | 'ready' | 'empty' | 'no-results' | 'error' | 'permission';

type SaveAttempt = { id: number; value: string };

function createRecoveryService() {
  let saveListener: ((attemptId: number, event: SaveEvent) => void) | undefined;
  let loadListener: ((value: string) => void) | undefined;
  let refreshListener: ((event: 'failed' | 'accepted') => void) | undefined;
  let listListener: ((state: ListState) => void) | undefined;
  let nextSaveId = 1;
  const saves: SaveAttempt[] = [];
  let refreshAttempts = 0;

  return {
    subscribeSave(listener: (attemptId: number, event: SaveEvent) => void) {
      saveListener = listener;
      return () => { if (saveListener === listener) saveListener = undefined; };
    },
    subscribeLoad(listener: (value: string) => void) {
      loadListener = listener;
      return () => { if (loadListener === listener) loadListener = undefined; };
    },
    subscribeRefresh(listener: (event: 'failed' | 'accepted') => void) {
      refreshListener = listener;
      return () => { if (refreshListener === listener) refreshListener = undefined; };
    },
    subscribeList(listener: (state: ListState) => void) {
      listListener = listener;
      return () => { if (listListener === listener) listListener = undefined; };
    },
    resolveLoad(value: string) {
      loadListener?.(value);
    },
    startSave(value: string) {
      const id = nextSaveId++;
      saves.push({ id, value });
      document.body.dataset.saveAttempts = String(saves.length);
      return id;
    },
    emitSave(attemptId: number, event: SaveEvent) {
      saveListener?.(attemptId, event);
    },
    saves() {
      return saves.map((attempt) => ({ ...attempt }));
    },
    startRefresh() {
      refreshAttempts += 1;
      document.body.dataset.refreshAttempts = String(refreshAttempts);
    },
    emitRefresh(event: 'failed' | 'accepted') {
      refreshListener?.(event);
    },
    setListState(state: ListState) {
      listListener?.(state);
    },
  };
}

const recoveryService = createRecoveryService();
(globalThis as typeof globalThis & { __vfRecoveryService?: typeof recoveryService }).__vfRecoveryService = recoveryService;

function ProfileEditor() {
  const [loading, setLoading] = React.useState(true);
  const [committed, setCommitted] = React.useState('');
  const [draft, setDraft] = React.useState('');
  const [preview, setPreview] = React.useState('');
  const [currentAttempt, setCurrentAttempt] = React.useState<number | null>(null);
  const [pendingValue, setPendingValue] = React.useState('');
  const [status, setStatus] = React.useState('Loading profile.');
  const [error, setError] = React.useState('');
  const [reconciliation, setReconciliation] = React.useState('');

  React.useEffect(() => recoveryService.subscribeLoad((value) => {
    setCommitted(value);
    setDraft(value);
    setPreview(value);
    setLoading(false);
    setStatus('Profile loaded.');
  }), []);

  React.useEffect(() => recoveryService.subscribeSave((attemptId, event) => {
    if (event.type === 'accepted') {
      setCurrentAttempt((current) => {
        if (current === attemptId) {
          setCommitted(event.value);
          setPreview(event.value);
          setPendingValue('');
          setStatus(`Saved ${event.value} authoritatively.`);
          setError('');
          setReconciliation('');
        } else {
          setCommitted(event.value);
          setReconciliation(`Earlier attempt ${attemptId} committed remotely as ${event.value}. The newer local draft remains current and must be reconciled.`);
        }
        return current;
      });
      return;
    }

    setCurrentAttempt((current) => {
      if (current !== attemptId) return current;
      setPreview(committed);
      setPendingValue('');
      if (event.type === 'rejected') {
        setError('Save was rejected. The authoritative preview rolled back, and your draft is preserved for correction or retry.');
        setStatus('Save rejected.');
      } else {
        setError('The save service failed. No authoritative success is shown; your draft remains available.');
        setStatus('Save failed.');
      }
      return current;
    });
  }), [committed]);

  function save() {
    const value = draft.trim();
    if (!value) {
      setError('Enter a display name.');
      setStatus('Validation blocked submission.');
      return;
    }
    if (currentAttempt !== null && pendingValue === value) {
      document.body.dataset.duplicatePolicy = 'ignored-same-pending-intent';
      setStatus('Repeated identical save ignored while the same intent is pending.');
      return;
    }
    const id = recoveryService.startSave(value);
    setCurrentAttempt(id);
    setPendingValue(value);
    setPreview(value);
    setError('');
    setStatus(`Save attempt ${id} pending. Preview is optimistic, not committed success.`);
  }

  if (loading) {
    return (
      <section aria-labelledby="editor-heading">
        <Text as="h2" variant="heading-md" id="editor-heading">Profile editor</Text>
        <Text as="p" role="status">Loading profile. No empty or error state is committed yet.</Text>
      </section>
    );
  }

  return (
    <section aria-labelledby="editor-heading">
      <Text as="h2" variant="heading-md" id="editor-heading">Profile editor</Text>
      <Text as="p">Committed value: <Text as="strong" variant="label-md" data-committed-value>{committed}</Text></Text>
      <Text as="p">Visible preview: <Text as="strong" variant="label-md" data-preview-value>{preview}</Text>{pendingValue ? ' (pending)' : ''}</Text>
      <label htmlFor="recovery-display-name">Display name</label>
      <Input
        id="recovery-display-name"
        value={draft}
        aria-invalid={error === 'Enter a display name.' || undefined}
        aria-describedby={error ? 'recovery-editor-error' : undefined}
        onChange={(event) => setDraft(event.currentTarget.value)}
      />
      <div>
        <Button type="button" loading={pendingValue !== ''} onClick={save}>Save changes</Button>
      </div>
      <Text as="p" role="status" data-editor-status>{status}</Text>
      {error ? <Text as="p" id="recovery-editor-error" role="alert">{error}</Text> : null}
      {reconciliation ? <Text as="p" data-reconciliation>{reconciliation}</Text> : null}
    </section>
  );
}

function StaleRead() {
  const [value, setValue] = React.useState('Quarterly revenue: 42');
  const [message, setMessage] = React.useState('Data loaded at 10:00.');
  const [stale, setStale] = React.useState(false);

  React.useEffect(() => recoveryService.subscribeRefresh((event) => {
    if (event === 'failed') {
      setStale(true);
      setMessage('Refresh failed. Showing stale data last updated at 10:00.');
    } else {
      setStale(false);
      setValue('Quarterly revenue: 43');
      setMessage('Refresh completed at 10:05.');
    }
  }), []);

  function refresh() {
    recoveryService.startRefresh();
    setMessage('Refreshing report. Existing useful data remains visible.');
  }

  return (
    <section aria-labelledby="stale-heading">
      <Text as="h2" variant="heading-md" id="stale-heading">Revenue report</Text>
      <Text as="p" data-report-value>{value}</Text>
      <Text as="p" role="status">{message}</Text>
      {stale ? <Text as="p" data-stale-state>Stale — last updated 10:00.</Text> : null}
      <Button type="button" variant="secondary" onClick={refresh}>{stale ? 'Try again' : 'Refresh report'}</Button>
    </section>
  );
}

function ListStates() {
  const [state, setState] = React.useState<ListState>('loading');
  const [query, setQuery] = React.useState('quarterly');
  React.useEffect(() => recoveryService.subscribeList(setState), []);

  return (
    <section aria-labelledby="list-heading">
      <Text as="h2" variant="heading-md" id="list-heading">Projects</Text>
      <label htmlFor="project-query">Search projects</label>
      <Input id="project-query" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
      <div aria-live="polite" aria-atomic="true">
        {state === 'loading' ? <Text as="p">Loading projects. Results are not known yet.</Text> : null}
        {state === 'ready' ? <ul><li>Atlas</li><li>Beacon</li></ul> : null}
        {state === 'empty' ? <Text as="p">No projects yet. Create a project to get started.</Text> : null}
        {state === 'no-results' ? <Text as="p">No results for “{query}”. Change or clear the current search.</Text> : null}
        {state === 'error' ? <Text as="p">Projects could not be loaded. Try again when the service is available.</Text> : null}
        {state === 'permission' ? <Text as="p">You do not have permission to view these projects. Request access if your organization supports it.</Text> : null}
      </div>
      {state === 'no-results' ? <Button type="button" variant="secondary" onClick={() => setQuery('')}>Clear search</Button> : null}
      {state === 'error' ? <Button type="button" variant="secondary">Try again</Button> : null}
      {state === 'permission' ? <Button type="button" variant="secondary">Request access</Button> : null}
    </section>
  );
}

function App() {
  return (
    <main>
      <Text as="h1" variant="heading-lg">Recovery workflows</Text>
      <Text as="p">This fixture uses deterministic application-owned services. VyrnForge public components provide control semantics; domain state, persistence, retry policy, permissions, and reconciliation remain application-owned.</Text>
      <ProfileEditor />
      <StaleRead />
      <ListStates />
      <Button type="button" variant="secondary" id="focus-sentinel">Keep task focus</Button>
    </main>
  );
}

document.body.dataset.saveAttempts = '0';
document.body.dataset.refreshAttempts = '0';
createRoot(document.querySelector('#root')!).render(<App />);
