const root = document.documentElement;
const body = document.body;
const siteRoot = new URL(body.dataset.vfSiteRoot || './', window.location.href);
const frameworkSelect = document.querySelector('[data-vf-framework-select]');
const frameworkRoutesNode = document.querySelector('#vf-framework-routes');
const storageKey = 'vyrnforge.docs.framework';

if (frameworkSelect && frameworkRoutesNode) {
  const routes = JSON.parse(frameworkRoutesNode.textContent || '{}');
  const currentFramework = body.dataset.vfFramework || '';
  const storedFramework = window.localStorage.getItem(storageKey) || '';
  frameworkSelect.value = currentFramework || storedFramework || '';
  frameworkSelect.addEventListener('change', () => {
    const framework = frameworkSelect.value;
    if (!framework) return;
    window.localStorage.setItem(storageKey, framework);
    const target = routes[framework];
    if (target) window.location.assign(new URL(target, siteRoot));
  });
}

const searchInput = document.querySelector('[data-vf-docs-search]');
const searchResults = document.querySelector('[data-vf-docs-search-results]');
let searchIndexPromise;

function loadSearchIndex() {
  searchIndexPromise ||= fetch(new URL('search-index.json', siteRoot)).then((response) => {
    if (!response.ok) throw new Error(`Unable to load docs search index: ${response.status}`);
    return response.json();
  });
  return searchIndexPromise;
}

function renderSearchResults(items) {
  if (!searchResults) return;
  searchResults.replaceChildren();
  if (items.length === 0) {
    searchResults.hidden = true;
    return;
  }
  for (const item of items.slice(0, 8)) {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.textContent = item.title;
    anchor.href = new URL(item.path || './', siteRoot);
    li.append(anchor);
    searchResults.append(li);
  }
  searchResults.hidden = false;
}

if (searchInput && searchResults) {
  searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return renderSearchResults([]);
    const index = await loadSearchIndex();
    renderSearchResults(index.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(query)));
  });
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      renderSearchResults([]);
    }
  });
}

root.dataset.vfDocsReady = 'true';
