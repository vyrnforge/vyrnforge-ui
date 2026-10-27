import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain } from '@vyrnforge/react/app-shell';
import { Button } from '@vyrnforge/react/button';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Input } from '@vyrnforge/react/input';
import '@vyrnforge/web/styles/app-shell.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/input.css';
import './example.css';

type ItemStatus = 'active' | 'archived';
type Item = { id: string; name: string; status: ItemStatus };
type BulkOutcome =
  | { id: string; state: 'committed' }
  | { id: string; state: 'failed'; reason: string }
  | { id: string; state: 'unknown' };

function createFakeCrudService() {
  let nextId = 5;
  let items: Item[] = [
    { id: 'atlas', name: 'Atlas', status: 'active' },
    { id: 'beacon', name: 'Beacon', status: 'active' },
    { id: 'cedar', name: 'Cedar', status: 'active' },
    { id: 'dormant', name: 'Dormant', status: 'archived' },
  ];
  let firstBulkAttempt = true;

  return {
    readItems() {
      return items.map((item) => ({ ...item }));
    },
    create(name: string) {
      const item = { id: `item-${nextId++}`, name, status: 'active' as const };
      items = [...items, item];
      return { ok: true as const, item: { ...item } };
    },
    edit(id: string, name: string) {
      items = items.map((item) => (item.id === id ? { ...item, name } : item));
      return { ok: true as const };
    },
    archive(id: string) {
      items = items.map((item) => (item.id === id ? { ...item, status: 'archived' as const } : item));
      return { ok: true as const };
    },
    restore(id: string) {
      items = items.map((item) => (item.id === id ? { ...item, status: 'active' as const } : item));
      return { ok: true as const };
    },
    bulkArchive(ids: string[]): BulkOutcome[] {
      if (!firstBulkAttempt) {
        items = items.map((item) => (ids.includes(item.id) ? { ...item, status: 'archived' as const } : item));
        return ids.map((id) => ({ id, state: 'committed' as const }));
      }

      firstBulkAttempt = false;
      const [committedId, failedId, unknownId] = ids;
      if (committedId) {
        items = items.map((item) =>
          item.id === committedId ? { ...item, status: 'archived' as const } : item,
        );
      }

      return [
        ...(committedId ? [{ id: committedId, state: 'committed' as const }] : []),
        ...(failedId ? [{ id: failedId, state: 'failed' as const, reason: 'Retention hold prevents archiving.' }] : []),
        ...(unknownId ? [{ id: unknownId, state: 'unknown' as const }] : []),
      ];
    },
  };
}

const crudService = createFakeCrudService();

function App() {
  const [items, setItems] = React.useState(() => crudService.readItems());
  const [createDraft, setCreateDraft] = React.useState('');
  const [editing, setEditing] = React.useState<{ id: string; draft: string } | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [bulkResults, setBulkResults] = React.useState<BulkOutcome[]>([]);
  const [lastBulkIds, setLastBulkIds] = React.useState<string[]>([]);
  const [lastRetryIds, setLastRetryIds] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState('No operation is in progress.');

  const activeItems = items.filter((item) => item.status === 'active');
  const archivedItems = items.filter((item) => item.status === 'archived');

  function refresh() {
    setItems(crudService.readItems());
  }

  function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = createDraft.trim();
    if (!name) return;
    const result = crudService.create(name);
    refresh();
    setCreateDraft('');
    setMessage(`Created ${result.item.name}.`);
  }

  function beginEdit(item: Item) {
    setEditing({ id: item.id, draft: item.name });
    setMessage(`Editing ${item.name}. Changes are not committed yet.`);
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const name = editing.draft.trim();
    if (!name) return;
    crudService.edit(editing.id, name);
    refresh();
    setEditing(null);
    setMessage(`Saved changes to ${name}.`);
  }

  function archiveItem(item: Item) {
    crudService.archive(item.id);
    refresh();
    setSelected((current) => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });
    setMessage(`Archived ${item.name}. It remains available in Archived items.`);
  }

  function restoreItem(item: Item) {
    crudService.restore(item.id);
    refresh();
    setMessage(`Restored ${item.name} to Active items.`);
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setBulkResults([]);
    setMessage('Selection cleared. No records changed.');
  }

  function archiveSelected() {
    const ids = activeItems.filter((item) => selected.has(item.id)).map((item) => item.id);
    if (ids.length === 0) return;
    setLastBulkIds(ids);
    const results = crudService.bulkArchive(ids);
    setBulkResults(results);
    refresh();
    const unresolved = results.filter((result) => result.state !== 'committed').map((result) => result.id);
    setSelected(new Set(unresolved));
    const committed = results.filter((result) => result.state === 'committed').length;
    const failed = results.filter((result) => result.state === 'failed').length;
    const unknown = results.filter((result) => result.state === 'unknown').length;
    setMessage(`${committed} item archived. ${failed} needs attention. ${unknown} outcome is unknown.`);
  }

  function retryUnresolved() {
    const ids = bulkResults.filter((result) => result.state !== 'committed').map((result) => result.id);
    if (ids.length === 0) return;
    setLastRetryIds(ids);
    const results = crudService.bulkArchive(ids);
    setBulkResults(results);
    refresh();
    setSelected(new Set());
    setMessage(`${results.length} unresolved items archived. Known successes were not repeated.`);
  }

  function nameFor(id: string) {
    return items.find((item) => item.id === id)?.name ?? id;
  }

  return (
    <AppShell>
      <AppShellHeader className="crud-shell-header">
        <strong>Operations workspace</strong>
        <span>STD-10 fake consumer service</span>
      </AppShellHeader>
      <AppShellBody>
        <AppShellMain className="crud-example-main">
          <header>
            <h1>Item management</h1>
            <p>This representative uses application-local fake data. VyrnForge does not own persistence, routing, authorization, or transaction policy.</p>
          </header>

          <section className="crud-status" aria-labelledby="crud-status-heading">
            <h2 id="crud-status-heading">Operation status</h2>
            <p role="status">{message}</p>
          </section>

          <section aria-labelledby="crud-create-heading">
            <h2 id="crud-create-heading">Create item</h2>
            <form className="crud-form" onSubmit={createItem}>
              <label htmlFor="crud-create-name">Item name</label>
              <Input id="crud-create-name" name="itemName" required value={createDraft} onChange={(event) => setCreateDraft(event.currentTarget.value)} />
              <Button type="submit">Create item</Button>
            </form>
          </section>

          {editing ? (
            <section aria-labelledby="crud-edit-heading">
              <h2 id="crud-edit-heading">Edit item</h2>
              <form className="crud-form" onSubmit={saveEdit}>
                <label htmlFor="crud-edit-name">Item name</label>
                <Input id="crud-edit-name" required value={editing.draft} onChange={(event) => setEditing({ ...editing, draft: event.currentTarget.value })} />
                <div className="crud-actions">
                  <Button type="submit">Save changes</Button>
                  <Button type="button" variant="secondary" onClick={() => { setEditing(null); setMessage('Edit cancelled. No changes were committed.'); }}>Cancel edit</Button>
                </div>
              </form>
            </section>
          ) : null}

          <section aria-labelledby="crud-active-heading">
            <div className="crud-section-heading">
              <div>
                <h2 id="crud-active-heading">Active items</h2>
                <p>{selected.size} selected. Selection applies only to the explicitly checked active items.</p>
              </div>
              <div className="crud-actions">
                <Button type="button" disabled={selected.size === 0} onClick={archiveSelected}>Archive selected</Button>
                <Button type="button" variant="secondary" disabled={selected.size === 0} onClick={clearSelection}>Clear selection</Button>
              </div>
            </div>
            <ul className="crud-item-list">
              {activeItems.map((item) => (
                <li key={item.id} data-item-id={item.id}>
                  <label className="crud-select-label">
                    <Checkbox checked={selected.has(item.id)} onChange={(event) => toggleSelected(item.id, event.currentTarget.checked)} aria-label={`Select ${item.name}`} />
                    <strong>{item.name}</strong>
                  </label>
                  <div className="crud-actions">
                    <Button type="button" variant="secondary" onClick={() => beginEdit(item)}>Edit {item.name}</Button>
                    <Button type="button" variant="secondary" onClick={() => archiveItem(item)}>Archive {item.name}</Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {bulkResults.length > 0 ? (
            <section className="crud-results" aria-labelledby="crud-results-heading">
              <h2 id="crud-results-heading">Bulk result</h2>
              <p>Last bulk request: {lastBulkIds.map(nameFor).join(', ')}.</p>
              {lastRetryIds.length > 0 ? <p>Last retry request: {lastRetryIds.map(nameFor).join(', ')}.</p> : null}
              <ul>
                {bulkResults.map((result) => (
                  <li key={result.id}>
                    <strong>{nameFor(result.id)}</strong>: {result.state === 'committed' ? 'archived' : result.state === 'failed' ? result.reason : 'outcome unknown; reconcile before retrying.'}
                  </li>
                ))}
              </ul>
              {bulkResults.some((result) => result.state !== 'committed') ? <Button type="button" onClick={retryUnresolved}>Retry unresolved</Button> : null}
            </section>
          ) : null}

          <section aria-labelledby="crud-archived-heading">
            <h2 id="crud-archived-heading">Archived items</h2>
            <ul className="crud-item-list">
              {archivedItems.map((item) => (
                <li key={item.id} data-item-id={item.id}>
                  <strong>{item.name}</strong>
                  <Button type="button" variant="secondary" onClick={() => restoreItem(item)}>Restore {item.name}</Button>
                </li>
              ))}
            </ul>
          </section>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
