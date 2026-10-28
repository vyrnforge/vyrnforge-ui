import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain } from '@vyrnforge/react/app-shell';
import { Button } from '@vyrnforge/react/button';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Input } from '@vyrnforge/react/input';
import { PaginationNext, PaginationPrevious, PaginationRoot } from '@vyrnforge/react/pagination';
import '@vyrnforge/web/styles/app-shell.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/pagination.css';
import './example.css';

type Status = 'Active' | 'Paused' | 'Pending';
type RecordRow = { id: number; name: string; status: Status };
type SortKey = 'name' | 'status';
type SortDirection = 'ascending' | 'descending';

const PAGE_SIZE = 5;
const RECORDS: RecordRow[] = [
  { id: 1, name: 'Atlas', status: 'Active' },
  { id: 2, name: 'Beacon', status: 'Paused' },
  { id: 3, name: 'Cedar', status: 'Pending' },
  { id: 4, name: 'Delta', status: 'Active' },
  { id: 5, name: 'Ember', status: 'Paused' },
  { id: 6, name: 'Fjord', status: 'Pending' },
  { id: 7, name: 'Grove', status: 'Active' },
  { id: 8, name: 'Harbor', status: 'Paused' },
  { id: 9, name: 'Indigo', status: 'Pending' },
  { id: 10, name: 'Juniper', status: 'Active' },
  { id: 11, name: 'Keystone', status: 'Paused' },
  { id: 12, name: 'Lumen', status: 'Pending' },
];

function App() {
  const [query, setQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('ascending');
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<number>>(() => new Set());
  const [actionStatus, setActionStatus] = React.useState('No bulk action has run.');

  const filtered = React.useMemo(() => RECORDS.filter((record) => record.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [query]);
  const sorted = React.useMemo(() => [...filtered].sort((a, b) => {
    const comparison = a[sortKey].localeCompare(b[sortKey]);
    return sortDirection === 'ascending' ? comparison : -comparison;
  }), [filtered, sortDirection, sortKey]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageSelected = pageRows.filter((row) => selected.has(row.id));
  const allPageSelected = pageRows.length > 0 && pageSelected.length === pageRows.length;
  const somePageSelected = pageSelected.length > 0 && !allPageSelected;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDirection((current) => current === 'ascending' ? 'descending' : 'ascending');
    else {
      setSortKey(key);
      setSortDirection('ascending');
    }
    setPage(1);
  }

  function toggleRow(id: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }

  function togglePage(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const row of pageRows) checked ? next.add(row.id) : next.delete(row.id);
      return next;
    });
  }

  function runBulkAction() {
    setActionStatus(pageSelected.length === 0
      ? 'No rows were changed because this page has no selection.'
      : `${pageSelected.length} selected row${pageSelected.length === 1 ? '' : 's'} on this page marked reviewed by the fake application action.`);
  }

  const pageSelectionMessage = `${pageSelected.length} selected on this page. Off-page results are not selected by the page selection control.`;

  return (
    <AppShell>
      <AppShellHeader><strong>Record review</strong></AppShellHeader>
      <AppShellBody>
        <AppShellMain className="table-example-main">
          <header>
            <h1>Native table management</h1>
            <p>This bounded example keeps native table semantics. Sorting, filtering, pagination, and selection do not create an ARIA grid.</p>
          </header>

          <div className="table-toolbar">
            <label htmlFor="record-filter">Filter by name</label>
            <Input id="record-filter" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} />
            <Button type="button" variant="secondary" onClick={() => { setQuery(''); setPage(1); }}>Clear filter</Button>
          </div>

          <p id="page-selection-status" role="status" aria-live="polite">{pageSelectionMessage}</p>

          <div className="table-scroll" role="region" aria-label="Record table" tabIndex={0}>
            <table>
              <caption>Records available for review</caption>
              <thead>
                <tr>
                  <th scope="col" className="selection-cell">
                    <Checkbox
                      aria-label="Select all rows on this page"
                      checked={allPageSelected}
                      indeterminate={somePageSelected}
                      onChange={(event) => togglePage(event.currentTarget.checked)}
                    />
                  </th>
                  <th scope="col" aria-sort={sortKey === 'name' ? sortDirection : undefined}>
                    <Button type="button" variant="secondary" onClick={() => toggleSort('name')}>
                      Name{sortKey === 'name' ? `, ${sortDirection}` : ''}
                    </Button>
                  </th>
                  <th scope="col" aria-sort={sortKey === 'status' ? sortDirection : undefined}>
                    <Button type="button" variant="secondary" onClick={() => toggleSort('status')}>
                      Status{sortKey === 'status' ? `, ${sortDirection}` : ''}
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id}>
                    <td className="selection-cell"><Checkbox aria-label={`Select ${row.name}`} checked={selected.has(row.id)} onChange={(event) => toggleRow(row.id, event.currentTarget.checked)} /></td>
                    <th scope="row">{row.name}</th>
                    <td>{row.status}</td>
                  </tr>
                ))}
                {pageRows.length === 0 ? <tr><td colSpan={3}>No records match the current filter.</td></tr> : null}
              </tbody>
            </table>
          </div>

          <div className="table-actions">
            <Button type="button" disabled={pageSelected.length === 0} onClick={runBulkAction}>Mark selected on this page reviewed</Button>
            <span role="status" aria-live="polite">{actionStatus}</span>
          </div>

          <PaginationRoot aria-label="Record pages">
            <PaginationPrevious href="#previous" aria-disabled={safePage === 1 || undefined} onClick={(event) => { event.preventDefault(); if (safePage > 1) setPage(safePage - 1); }}>Previous</PaginationPrevious>
            <span aria-live="polite">Page {safePage} of {pageCount}</span>
            <PaginationNext href="#next" aria-disabled={safePage === pageCount || undefined} onClick={(event) => { event.preventDefault(); if (safePage < pageCount) setPage(safePage + 1); }}>Next</PaginationNext>
          </PaginationRoot>

          <aside className="grid-decision-note">
            <h2>Why this is not a data grid</h2>
            <p>The task uses ordinary controls inside a semantic table. It does not require spreadsheet-style two-dimensional focus, cell editing, range selection, or author-managed arrow-key navigation.</p>
          </aside>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
