const root = document.documentElement;
const body = document.body;
const storageKey = 'vyrnforge.docs.framework';
let initialized = false;
let compilerPromise;

function headingId(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

function loadCompiler(url) {
  compilerPromise ||= new Promise((resolve, reject) => {
    if (globalThis.__vfDocsTypeScript) {
      resolve(globalThis.__vfDocsTypeScript);
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.addEventListener('load', () => resolve(globalThis.__vfDocsTypeScript));
    script.addEventListener('error', () => reject(new Error('Unable to load the live example compiler.')));
    document.head.append(script);
  });
  return compilerPromise;
}

function stripSupportedImports(source, allowedImports) {
  const allowed = new Set(allowedImports || []);
  const pattern = /^\s*import\s+(?:[^'"\n]+?\s+from\s+)?['"]([^'"]+)['"];\s*$/gm;
  const stripped = source.replace(pattern, (_statement, specifier) => {
    if (!allowed.has(specifier)) throw new Error(`Live examples do not load arbitrary imports: ${specifier}`);
    return '';
  });
  if (/^\s*import\b/m.test(stripped)) throw new Error('Live examples currently support one-line import declarations only.');
  if (/^\s*export\b/m.test(stripped)) throw new Error('Live examples run as entry files; export declarations are not supported in the editor.');
  return stripped;
}

function transpile(source, config, ts) {
  const bindings = config.bindings || [];
  const preamble = bindings.length ? `const { ${bindings.join(', ')} } = globalThis.__vfRuntime;` : '';
  const result = ts.transpileModule(`${preamble}\n${stripSupportedImports(source, config.imports)}`, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      experimentalDecorators: true,
      useDefineForClassFields: false
    },
    reportDiagnostics: true
  });
  const errors = (result.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length) throw new Error(errors.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')).join('\n'));
  return result.outputText;
}

function scriptSafe(value) {
  return value.replace(/<\/script/gi, '<\\/script');
}

function liveDocument({ id, framework, code, runtimeUrl, stylesUrl, frameCssUrl }) {
  const rootMarkup = framework === 'angular'
    ? '<vf-example-root id="root" class="vf-example-root"></vf-example-root>'
    : '<main id="root" class="vf-example-root"></main>';
  const report = `parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'ready'},'*')`;
  const reportError = `parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'error',message:String(error?.message || error)},'*')`;
  return `<!doctype html><html lang="en" data-vf-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="${stylesUrl}"><link rel="stylesheet" href="${frameCssUrl}"></head><body>${rootMarkup}<script>window.addEventListener('error',(event)=>parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'error',message:event.message || 'Runtime error'},'*'));window.addEventListener('unhandledrejection',(event)=>parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'error',message:String(event.reason?.message || event.reason || 'Unhandled rejection')},'*'));</script>${runtimeUrl ? `<script src="${runtimeUrl}"></script>` : ''}<script>try{${scriptSafe(code)}\nsetTimeout(()=>${report},0)}catch(error){${reportError}}</script></body></html>`;
}

function nativeDocument({ id, source, stylesUrl, frameCssUrl }) {
  return `<!doctype html><html lang="en" data-vf-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="${stylesUrl}"><link rel="stylesheet" href="${frameCssUrl}"></head><body><main class="vf-example-root">${source}</main><script>parent.postMessage({type:'vf-example-result',id:${JSON.stringify(id)},status:'ready'},'*')</script></body></html>`;
}

function enhanceDocumentationPage(siteRoot) {
  const main = document.querySelector('[data-vf-app-shell-main]');
  if (!main || main.querySelector(':scope > .vf-docs-content-layout')) return;
  const currentLink = document.querySelector('[data-vf-side-nav-link][aria-current="page"]');
  const currentGroup = currentLink?.closest('[data-vf-side-nav-group]')?.querySelector('[data-vf-side-nav-group-label]')?.textContent?.trim();
  const article = document.createElement('article');
  article.className = 'vf-docs-article';
  while (main.firstChild) article.append(main.firstChild);
  const title = article.querySelector(':scope > h1');
  if (title) {
    const breadcrumbs = document.createElement('nav');
    breadcrumbs.className = 'vf-docs-breadcrumbs';
    breadcrumbs.setAttribute('aria-label', 'Breadcrumb');
    const list = document.createElement('ol');
    const homeItem = document.createElement('li');
    const homeLink = document.createElement('a');
    homeLink.href = siteRoot;
    homeLink.textContent = 'Docs';
    homeItem.append(homeLink);
    list.append(homeItem);
    if (currentGroup) {
      const groupItem = document.createElement('li');
      groupItem.textContent = currentGroup;
      list.append(groupItem);
    }
    const pageItem = document.createElement('li');
    pageItem.textContent = title.textContent.trim();
    pageItem.setAttribute('aria-current', 'page');
    list.append(pageItem);
    breadcrumbs.append(list);
    article.insertBefore(breadcrumbs, article.firstChild);
  }
  const usedIds = new Set([...article.querySelectorAll('[id]')].map((node) => node.id));
  const headings = [...article.querySelectorAll('h2, h3')];
  for (const heading of headings) {
    if (heading.id) continue;
    const base = headingId(heading.textContent);
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    heading.id = id;
    usedIds.add(id);
  }
  const layout = document.createElement('div');
  layout.className = 'vf-docs-content-layout';
  layout.append(article);
  if (headings.length) {
    const aside = document.createElement('aside');
    aside.className = 'vf-docs-toc';
    const label = document.createElement('strong');
    label.textContent = 'On this page';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'On this page');
    const list = document.createElement('ul');
    for (const heading of headings) {
      const item = document.createElement('li');
      item.dataset.vfTocLevel = heading.tagName === 'H3' ? '3' : '2';
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      item.append(link);
      list.append(item);
    }
    nav.append(list);
    aside.append(label, nav);
    layout.append(aside);
  }
  main.append(layout);
}

function initializeDocs() {
  if (initialized || !document.querySelector('[data-vf-app-shell]')) return;
  initialized = true;

  const siteRoot = new URL(body.dataset.vfSiteRoot || './', window.location.href);
  const assetRoot = new URL(body.dataset.vfAssetRoot || body.dataset.vfSiteRoot || './', window.location.href);
  const framework = body.dataset.vfFramework || '';
  if (framework) window.localStorage.setItem(storageKey, framework);

  const frameworkPicker = document.querySelector('[data-vf-framework-picker]');
  if (frameworkPicker) {
    for (const choice of frameworkPicker.querySelectorAll('[data-vf-framework-choice]')) {
      choice.addEventListener('click', () => {
        const target = choice.dataset.vfFrameworkChoice;
        if (target) window.localStorage.setItem(storageKey, target);
      });
    }
  }

  enhanceDocumentationPage(siteRoot);

  const searchInput = document.querySelector('[data-vf-docs-search]');
  const searchResults = document.querySelector('[data-vf-docs-search-results]');
  if (searchInput) searchInput.placeholder = 'Search docs…';
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
    for (const item of items.slice(0, 8)) {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.textContent = item.title;
      anchor.href = new URL(item.path || './', siteRoot);
      li.append(anchor);
      searchResults.append(li);
    }
    searchResults.hidden = items.length === 0;
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

  const exampleStates = new Map();
  const exampleNodes = [...document.querySelectorAll('[data-vf-example-id]')];
  for (const node of exampleNodes) {
    const dataNode = node.querySelector('[data-vf-example-data]');
    if (!dataNode) continue;
    const data = JSON.parse(dataNode.textContent || '{}');
    const config = data.frameworks?.[framework];
    if (!config) continue;
    const frame = node.querySelector('[data-vf-example-frame]');
    const editor = node.querySelector('[data-vf-example-source]');
    const editorPanel = node.querySelector('[data-vf-example-editor]');
    const codeToggle = node.querySelector('[data-vf-example-code-toggle]');
    const language = node.querySelector('[data-vf-example-language]');
    const status = node.querySelector('[data-vf-example-status]');
    const runButton = node.querySelector('[data-vf-example-run]');
    const resetButton = node.querySelector('[data-vf-example-reset]');
    const state = { data, frame, status };
    exampleStates.set(data.id, state);

    function resetExample() {
      editor.value = config.source;
      language.textContent = config.language.toUpperCase();
      frame.removeAttribute('srcdoc');
      frame.src = new URL(config.preview, assetRoot);
      frame.title = `${data.title} ${framework} preview`;
      status.textContent = `${framework} example ready.`;
    }

    if (codeToggle && editorPanel) {
      codeToggle.addEventListener('click', () => {
        const expanded = codeToggle.getAttribute('aria-expanded') !== 'true';
        codeToggle.setAttribute('aria-expanded', String(expanded));
        codeToggle.textContent = expanded ? 'Hide code' : 'Show code';
        editorPanel.hidden = !expanded;
      });
    }

    resetButton.addEventListener('click', resetExample);
    runButton.addEventListener('click', async () => {
      runButton.disabled = true;
      status.textContent = 'Compiling example…';
      try {
        const stylesUrl = new URL(data.styles, assetRoot).href;
        const frameCssUrl = new URL(data.frameCss, assetRoot).href;
        frame.removeAttribute('src');
        if (framework === 'native-web') {
          frame.srcdoc = nativeDocument({ id: data.id, source: editor.value, stylesUrl, frameCssUrl });
        } else {
          const ts = await loadCompiler(new URL(data.compiler, assetRoot).href);
          const code = transpile(editor.value, config, ts);
          frame.srcdoc = liveDocument({
            id: data.id,
            framework,
            code,
            runtimeUrl: config.runtime ? new URL(config.runtime, assetRoot).href : '',
            stylesUrl,
            frameCssUrl
          });
        }
        status.textContent = 'Running example…';
      } catch (error) {
        status.textContent = `Unable to run: ${error.message}`;
      } finally {
        runButton.disabled = false;
      }
    });
    resetExample();
  }

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.type !== 'vf-example-result') return;
    const state = exampleStates.get(data.id);
    if (!state || event.source !== state.frame.contentWindow) return;
    state.status.textContent = data.status === 'ready' ? 'Live preview updated.' : `Runtime error: ${data.message || 'Unknown error'}`;
  });

  root.dataset.vfDocsReady = 'true';
}

if (document.querySelector('[data-vf-app-shell]')) initializeDocs();
document.addEventListener('vfdocsrendered', initializeDocs, { once: true });
window.addEventListener('DOMContentLoaded', initializeDocs, { once: true });
