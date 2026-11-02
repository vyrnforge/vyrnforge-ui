export function readDocsPageModel() {
  const element = document.querySelector('#vf-docs-page-model');
  return JSON.parse(element?.textContent || '{}');
}

export function markDocsRendered(framework) {
  document.documentElement.dataset.vfDocsRendered = framework;
  document.dispatchEvent(new CustomEvent('vfdocsrendered', { detail: { framework } }));
}
