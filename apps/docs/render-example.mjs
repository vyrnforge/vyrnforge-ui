import {
  escapeHtml,
  renderExampleControls,
  renderExampleData,
  renderExampleEditor,
  renderExampleHeader,
  renderExamplePreview
} from './example-components.mjs';

export function renderDocumentationExample(example) {
  if (!example) throw new Error('Cannot render missing documentation example');

  return `<section class="vf-example" data-vf-example-id="${escapeHtml(example.id)}" data-vf-example-default-framework="${escapeHtml(example.defaultFramework)}">\n  ${renderExampleHeader(example)}\n  ${renderExamplePreview(example)}\n  ${renderExampleControls()}\n  ${renderExampleEditor(example)}\n  ${renderExampleData(example)}\n</section>`;
}
