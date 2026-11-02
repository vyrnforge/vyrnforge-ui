export const documentationContentFormat = 'vyrnforge.docs.content.v1';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function parseInline(value = '') {
  const source = String(value);
  const parts = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ kind: 'text', value: source.slice(cursor, index) });
    const token = match[0];
    if (token.startsWith('**')) parts.push({ kind: 'strong', value: token.slice(2, -2) });
    else parts.push({ kind: 'code', value: token.slice(1, -1) });
    cursor = index + token.length;
  }
  if (cursor < source.length) parts.push({ kind: 'text', value: source.slice(cursor) });
  return parts;
}

export function assertDocumentationContentModel(model, source = 'documentation content model') {
  if (!model || typeof model !== 'object' || Array.isArray(model)) {
    throw new Error(`${source} must be an object`);
  }
  if (model.format !== documentationContentFormat) {
    throw new Error(`${source} must use ${documentationContentFormat}`);
  }
  if (typeof model.lede !== 'string' || !Array.isArray(model.sections)) {
    throw new Error(`${source} must provide lede and sections`);
  }
  if (model.frameworks && (typeof model.frameworks !== 'object' || Array.isArray(model.frameworks))) {
    throw new Error(`${source} frameworks must be an object`);
  }
  return model;
}

export function parseDocumentationContentModel(value, source = 'documentation content model') {
  return assertDocumentationContentModel(JSON.parse(value), source);
}

export async function readDocumentationContentModel(filePath) {
  const processApi = globalThis.process;
  if (!processApi?.getBuiltinModule) {
    throw new Error('readDocumentationContentModel is only available in the Node documentation compiler');
  }
  const { readFile } = processApi.getBuiltinModule('node:fs/promises');
  return parseDocumentationContentModel(await readFile(filePath, 'utf8'), filePath);
}

export function referencedDocumentationExamples(model) {
  const ids = [];
  for (const section of model.sections ?? []) {
    for (const block of section.blocks ?? []) {
      if (block.type === 'example' && block.id) ids.push(block.id);
    }
  }
  return [...new Set(ids)];
}

function resolveExampleBlock(block, framework, examples) {
  const example = examples.get(block.id);
  if (!example) throw new Error(`Documentation references unknown executable example: ${block.id}`);
  const config = example.frameworks?.[framework];
  if (!config) {
    return {
      type: 'example-unavailable',
      id: example.id,
      title: example.title,
      description: example.description || '',
      framework,
    };
  }
  return {
    type: 'example',
    id: example.id,
    title: example.title,
    description: example.description || '',
    framework,
    data: {
      ...example,
      defaultFramework: framework,
      frameworks: { [framework]: config },
    },
  };
}

function resolveSection(section, framework, examples) {
  return {
    ...section,
    blocks: (section.blocks ?? []).map((block) =>
      block.type === 'example' ? resolveExampleBlock(block, framework, examples) : block,
    ),
  };
}

export function resolveDocumentationContent(model, { framework, examples, pageTitle, context = null }) {
  assertDocumentationContentModel(model);
  const adaptation = model.frameworks?.[framework];
  const sections = [];
  if (adaptation) {
    sections.push({
      title: adaptation.title,
      adaptation: framework,
      blocks: adaptation.blocks ?? [],
    });
  }
  sections.push(...model.sections);
  return {
    format: documentationContentFormat,
    framework,
    pageTitle,
    context,
    lede: model.lede,
    meta: model.meta ?? [],
    sections: sections.map((section) => resolveSection(section, framework, examples)),
  };
}

function flattenStrings(value, output) {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) for (const item of value) flattenStrings(item, output);
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'data') continue;
      flattenStrings(item, output);
    }
  }
}

export function documentationContentText(content) {
  const output = [];
  flattenStrings(content, output);
  return output.join(' ').replace(/\s+/g, ' ').trim();
}

function renderInline(value) {
  return parseInline(value)
    .map((part) => {
      if (part.kind === 'code') return `<code>${escapeHtml(part.value)}</code>`;
      if (part.kind === 'strong') return `<strong>${escapeHtml(part.value)}</strong>`;
      return escapeHtml(part.value);
    })
    .join('');
}

function renderFrameworkMark(context) {
  if (!context?.mark) return '';
  return `<svg class="vf-framework-mark" data-vf-framework-mark="${escapeHtml(context.framework)}" viewBox="${escapeHtml(context.mark.viewBox)}" aria-hidden="true" focusable="false"><path d="${escapeHtml(context.mark.path)}"></path></svg>`;
}

function renderExample(block) {
  if (block.type === 'example-unavailable') {
    return `<section class="vf-example--unavailable" data-vf-example-unavailable="${escapeHtml(block.id)}"><h3 data-vf-text data-vf-text-variant="heading-sm">${escapeHtml(block.title)}</h3><p data-vf-text data-vf-text-variant="body-md">This executable example is not available for the selected framework in this documentation channel.</p></section>`;
  }
  const data = block.data;
  return `<section class="vf-example" data-vf-example-id="${escapeHtml(block.id)}" data-vf-example-default-framework="${escapeHtml(block.framework)}" data-vf-example-locked-framework="${escapeHtml(block.framework)}">
    <header class="vf-example__header"><div><h3 data-vf-text data-vf-text-variant="heading-sm">${escapeHtml(block.title)}</h3>${block.description ? `<p data-vf-text data-vf-text-variant="body-md">${escapeHtml(block.description)}</p>` : ''}</div><span class="vf-example__framework">${escapeHtml(block.framework)}</span></header>
    <div class="vf-example__preview"><iframe data-vf-example-frame title="${escapeHtml(block.title)} preview" sandbox="allow-scripts"></iframe></div>
    <div class="vf-example__controls"><button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" data-vf-example-code-toggle aria-expanded="false">Show code</button></div>
    <div class="vf-example__editor" data-vf-example-editor hidden>
      <div class="vf-example__editor-toolbar"><strong data-vf-text data-vf-text-variant="label-md">Editable source</strong><span data-vf-example-language></span><span class="vf-example__editor-actions"><button type="button" data-vf-button data-vf-variant="primary" data-vf-size="sm" data-vf-example-run>Run</button><button type="button" data-vf-button data-vf-variant="secondary" data-vf-size="sm" data-vf-example-reset>Reset</button></span></div>
      <textarea data-vf-textarea data-vf-example-source spellcheck="false" aria-label="${escapeHtml(block.title)} code editor"></textarea>
      <p data-vf-text data-vf-text-variant="body-sm" class="vf-example__status" data-vf-example-status aria-live="polite">Ready.</p>
    </div>
    <script type="application/json" data-vf-example-data>${safeJson(data)}</script>
  </section>`;
}

function renderBlock(block, framework) {
  if (block.type === 'paragraph') return `<p data-vf-text data-vf-text-variant="body-md">${renderInline(block.text)}</p>`;
  if (block.type === 'heading') {
    const level = Math.min(6, Math.max(3, Number(block.level) || 3));
    return `<h${level} data-vf-text data-vf-text-variant="heading-sm">${renderInline(block.text)}</h${level}>`;
  }
  if (block.type === 'code') {
    const usage = block.frameworkUsage ? ` data-vf-framework-usage-code="${escapeHtml(framework)}"` : '';
    return `<pre tabindex="0"${usage}><code class="language-${escapeHtml(block.language || 'text')}">${escapeHtml(block.value || '')}</code></pre>`;
  }
  if (block.type === 'split') {
    return `<div class="vf-docs-split">${(block.items ?? []).map((item) => `<article data-vf-surface class="vf-docs-card vf-docs-card--${escapeHtml(item.tone || 'neutral')}"><h3 data-vf-text data-vf-text-variant="heading-sm">${escapeHtml(item.title)}</h3><p data-vf-text data-vf-text-variant="body-md">${renderInline(item.text)}</p></article>`).join('')}</div>`;
  }
  if (block.type === 'example' || block.type === 'example-unavailable') return renderExample(block);
  if (block.type === 'list') return `<ul>${(block.items ?? []).map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`;
  if (block.type === 'note') return `<aside data-vf-surface class="vf-docs-note">${renderInline(block.text)}</aside>`;
  if (block.type === 'table') {
    const header = (block.columns ?? []).map((column) => `<th>${renderInline(column)}</th>`).join('');
    const rows = (block.rows ?? []).map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${renderInline(cell)}</th>` : `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('');
    return `<div data-vf-surface class="vf-docs-table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(block.label || 'Reference table')}"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  throw new Error(`Unsupported documentation content block: ${block.type}`);
}

export function renderDocumentationContentHtml(content) {
  const context = content.context;
  const contextHtml = context
    ? `<div class="vf-docs-framework-context" data-vf-framework-context="${escapeHtml(context.framework)}"><strong>${renderFrameworkMark(context)}<span>${escapeHtml(context.label)}</span></strong><span>${context.entrypoint ? `Public entrypoint: <code>${escapeHtml(context.entrypoint)}</code>` : 'Framework-specific documentation view'}</span></div>`
    : '';
  const meta = (content.meta ?? []).length
    ? `<div class="vf-docs-page-meta" aria-label="${escapeHtml(content.pageTitle)} characteristics">${content.meta.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>`
    : '';
  const sections = (content.sections ?? []).map((section) => `<section${section.adaptation ? ` data-vf-framework-adaptation="${escapeHtml(section.adaptation)}"` : ''}><h2 data-vf-text data-vf-text-variant="heading-md">${escapeHtml(section.title)}</h2>${(section.blocks ?? []).map((block) => renderBlock(block, content.framework)).join('')}</section>`).join('');
  return `<h1 data-vf-text data-vf-text-variant="heading-lg">${escapeHtml(content.pageTitle)}</h1>${contextHtml}<p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">${renderInline(content.lede)}</p>${meta}${sections}`;
}
