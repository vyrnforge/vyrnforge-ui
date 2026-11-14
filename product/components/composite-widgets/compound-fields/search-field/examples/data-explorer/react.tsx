import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { SearchFieldClear, SearchFieldInput, SearchFieldRoot } from '@vyrnforge/react/search-field';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/native-select.css';
import '@vyrnforge/web/styles/search-field.css';
import './example.css';

type Sort = 'name' | 'updated';
type Criteria = { query: string; activeOnly: boolean; mineOnly: boolean; sort: Sort };
type Project = { id: number; name: string; active: boolean; mine: boolean; updated: number };

const locale = 'en';
const defaults: Criteria = { query: '', activeOnly: false, mineOnly: false, sort: 'name' };
const projects: Project[] = [
  { id: 1, name: 'Atlas migration', active: true, mine: true, updated: 6 },
  { id: 2, name: 'Beacon redesign', active: true, mine: false, updated: 4 },
  { id: 3, name: 'Cinder archive', active: false, mine: true, updated: 2 },
  { id: 4, name: 'Delta research', active: true, mine: true, updated: 5 },
  { id: 5, name: 'Ember rollout', active: false, mine: false, updated: 1 },
  { id: 6, name: 'Forge beta', active: true, mine: false, updated: 3 },
];

function readCriteria(): Criteria {
  const params = new URL(window.location.href).searchParams;
  const sort = params.get('sort');
  return {
    query: params.get('q') ?? '',
    activeOnly: params.get('active') === '1',
    mineOnly: params.get('mine') === '1',
    sort: sort === 'updated' ? 'updated' : 'name',
  };
}

function hrefFor(criteria: Criteria) {
  const url = new URL(window.location.href);
  url.searchParams.delete('q');
  url.searchParams.delete('active');
  url.searchParams.delete('mine');
  url.searchParams.delete('sort');
  if (criteria.query) url.searchParams.set('q', criteria.query);
  if (criteria.activeOnly) url.searchParams.set('active', '1');
  if (criteria.mineOnly) url.searchParams.set('mine', '1');
  if (criteria.sort !== defaults.sort) url.searchParams.set('sort', criteria.sort);
  return `${url.pathname}${url.search}${url.hash}`;
}

function fakeSearch(criteria: Criteria) {
  const normalizedQuery = criteria.query.toLocaleLowerCase(locale);
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const next = projects.filter((project) => {
    if (normalizedQuery && !project.name.toLocaleLowerCase(locale).includes(normalizedQuery)) return false;
    if (criteria.activeOnly && !project.active) return false;
    if (criteria.mineOnly && !project.mine) return false;
    return true;
  });
  next.sort((a, b) => criteria.sort === 'updated' ? b.updated - a.updated : collator.compare(a.name, b.name));
  const delay = criteria.query.toLocaleLowerCase(locale).includes('atlas') ? 90 : 15;
  return new Promise<Project[]>((resolve) => window.setTimeout(() => resolve(next), delay));
}

function App() {
  const initial = React.useMemo(() => readCriteria(), []);
  const [criteria, setCriteria] = React.useState<Criteria>(initial);
  const [draftQuery, setDraftQuery] = React.useState(initial.query);
  const [results, setResults] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isComposing = React.useRef(false);
  const requestId = React.useRef(0);

  const run = React.useCallback((next: Criteria) => {
    const id = ++requestId.current;
    setLoading(true);
    void fakeSearch(next).then((items) => {
      if (id !== requestId.current) return;
      setResults(items);
      setLoading(false);
    });
  }, []);

  const commit = React.useCallback((next: Criteria, history: 'push' | 'none' = 'push') => {
    setCriteria(next);
    if (history === 'push') window.history.pushState({}, '', hrefFor(next));
    run(next);
  }, [run]);

  React.useEffect(() => {
    run(initial);
    const onPopState = () => {
      const next = readCriteria();
      setDraftQuery(next.query);
      commit(next, 'none');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [commit, initial, run]);

  const submitQuery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isComposing.current) return;
    commit({ ...criteria, query: draftQuery });
  };

  const reset = () => {
    setDraftQuery('');
    commit(defaults);
  };

  return (
    <main className="vf-data-explorer" lang={locale}>
      <h1>Project explorer</h1>
      <form className="vf-data-explorer__search" onSubmit={submitQuery}>
        <SearchFieldRoot className="vf-data-explorer__search-field" value={draftQuery} onValueChange={setDraftQuery}>
          <label htmlFor="project-query">Search projects</label>
          <SearchFieldInput
            id="project-query"
            onCompositionStart={() => { isComposing.current = true; }}
            onCompositionEnd={() => { isComposing.current = false; }}
          />
          <SearchFieldClear aria-label="Clear project search" />
        </SearchFieldRoot>
        <Button type="submit">Search</Button>
      </form>

      <div className="vf-data-explorer__controls">
        <fieldset className="vf-data-explorer__facets">
          <legend>Filters</legend>
          <label className="vf-data-explorer__facet">
            <Checkbox checked={criteria.activeOnly} onChange={(event) => commit({ ...criteria, activeOnly: event.currentTarget.checked })} />
            Active only
          </label>
          <label className="vf-data-explorer__facet">
            <Checkbox checked={criteria.mineOnly} onChange={(event) => commit({ ...criteria, mineOnly: event.currentTarget.checked })} />
            Owned by me
          </label>
        </fieldset>
        <label className="vf-data-explorer__sort">
          Sort by
          <NativeSelect value={criteria.sort} onChange={(event) => commit({ ...criteria, sort: event.currentTarget.value as Sort })}>
            <option value="name">Name</option>
            <option value="updated">Recently updated</option>
          </NativeSelect>
        </label>
        <Button type="button" variant="secondary" onClick={reset}>Reset search and filters</Button>
      </div>

      <p className="vf-data-explorer__status" role="status" aria-live="polite">
        {loading ? 'Updating results…' : `${results.length} project${results.length === 1 ? '' : 's'}`}
      </p>

      {!loading && results.length === 0 ? (
        <section className="vf-data-explorer__zero" aria-labelledby="zero-results-heading">
          <h2 id="zero-results-heading">No matching projects</h2>
          <p>Try another search or reset the active filters.</p>
          <Button type="button" onClick={reset}>Reset search and filters</Button>
        </section>
      ) : (
        <ul className="vf-data-explorer__results" aria-label="Project results">
          {results.map((project) => (
            <li className="vf-data-explorer__result" key={project.id}>
              <strong>{project.name}</strong>
              <p className="vf-data-explorer__meta">{project.active ? 'Active' : 'Archived'} · {project.mine ? 'Owned by me' : 'Team-owned'}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
