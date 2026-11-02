import { frameworkLabel, renderFrameworkMark, supportedFrameworks } from './framework-presentation.mjs';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function renderExampleFrameworkTabs(example) {
  return supportedFrameworks
    .filter((framework) => example.frameworks[framework])
    .map((framework) => {
      return `<button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" role="tab" data-vf-example-framework="${escapeHtml(framework)}" aria-selected="false">${renderFrameworkMark(framework)}<span>${escapeHtml(frameworkLabel(framework))}</span></button>`;
    })
    .join('');
}

export function renderExampleHeader(example) {
  const tabs = renderExampleFrameworkTabs(example);
  const description = example.description ? `<p>${escapeHtml(example.description)}</p>` : '';

  return `<header class="vf-example__header"><div><h3>${escapeHtml(example.title)}</h3>${description}</div><div class="vf-example__tabs" role="tablist" aria-label="Example framework">${tabs}</div></header>`;
}

export function renderExamplePreview(example) {
  return `<div class="vf-example__preview"><iframe data-vf-example-frame title="${escapeHtml(example.title)} preview" sandbox="allow-scripts"></iframe></div>`;
}

export function renderExampleControls() {
  return `<div class="vf-example__controls"><button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" data-vf-example-code-toggle aria-expanded="false">Show code</button></div>`;
}

export function renderExampleEditor(example) {
  return `<div class="vf-example__editor" data-vf-example-editor hidden>\n    <div class="vf-example__editor-toolbar"><strong>Editable source</strong><span data-vf-example-language></span><span class="vf-example__editor-actions"><button type="button" data-vf-button data-vf-variant="primary" data-vf-size="sm" data-vf-example-run>Run</button><button type="button" data-vf-button data-vf-variant="secondary" data-vf-size="sm" data-vf-example-reset>Reset</button></span></div>\n    <textarea data-vf-example-source spellcheck="false" aria-label="${escapeHtml(example.title)} code editor"></textarea>\n    <p class="vf-example__status" data-vf-example-status aria-live="polite">Ready.</p>\n  </div>`;
}

export function renderExampleData(example) {
  return `<script type="application/json" data-vf-example-data>${safeJson(example)}</script>`;
}
