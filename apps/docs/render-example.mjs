import { frameworkLabel, renderFrameworkMark, supportedFrameworks } from './framework-presentation.mjs';

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function renderDocumentationExample(example) {
  if (!example) throw new Error('Cannot render missing documentation example');
  const tabs = supportedFrameworks
    .filter((framework) => example.frameworks[framework])
    .map((framework) => {
      const config = example.frameworks[framework];
      return `<button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" role="tab" data-vf-example-framework="${escapeHtml(framework)}" aria-selected="false">${renderFrameworkMark(framework)}<span>${escapeHtml(frameworkLabel(framework))}</span></button>`;
    })
    .join('');
  return `<section class="vf-example" data-vf-example-id="${escapeHtml(example.id)}" data-vf-example-default-framework="${escapeHtml(example.defaultFramework)}">\n  <header class="vf-example__header"><div><h3>${escapeHtml(example.title)}</h3>${example.description ? `<p>${escapeHtml(example.description)}</p>` : ''}</div><div class="vf-example__tabs" role="tablist" aria-label="Example framework">${tabs}</div></header>\n  <div class="vf-example__preview"><iframe data-vf-example-frame title="${escapeHtml(example.title)} preview" sandbox="allow-scripts"></iframe></div>\n  <div class="vf-example__editor">\n    <div class="vf-example__editor-toolbar"><strong>Editable source</strong><span data-vf-example-language></span><span class="vf-example__editor-actions"><button type="button" data-vf-button data-vf-variant="primary" data-vf-size="sm" data-vf-example-run>Run</button><button type="button" data-vf-button data-vf-variant="secondary" data-vf-size="sm" data-vf-example-reset>Reset</button></span></div>\n    <textarea data-vf-example-source spellcheck="false" aria-label="${escapeHtml(example.title)} code editor"></textarea>\n    <p class="vf-example__status" data-vf-example-status aria-live="polite">Ready.</p>\n  </div>\n  <script type="application/json" data-vf-example-data>${safeJson(example)}</script>\n</section>`;
}
