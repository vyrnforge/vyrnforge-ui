import { describe, expect, it } from 'vitest';
import {
  renderExampleControls,
  renderExampleData,
  renderExampleEditor,
  renderExampleFrameworkTabs,
  renderExampleHeader,
  renderExamplePreview
} from './example-components.mjs';
import { renderDocumentationExample } from './render-example.mjs';

const example = {
  id: 'button/basic',
  title: 'Basic <button>',
  description: 'One contract & multiple framework surfaces.',
  defaultFramework: 'vue',
  frameworks: {
    'native-web': { label: 'Native Web', source: '<button>Save</button>' },
    react: { label: 'React', source: '<Button>Save</Button>' },
    vue: { label: 'Vue', source: '<VfButton>Save</VfButton>' }
  }
};

describe('documentation example view components', () => {
  it('renders only the framework tabs supported by the example', () => {
    const markup = renderExampleFrameworkTabs(example);

    expect(markup).toContain('data-vf-example-framework="native-web"');
    expect(markup).toContain('data-vf-example-framework="react"');
    expect(markup).toContain('data-vf-example-framework="vue"');
    expect(markup).not.toContain('data-vf-example-framework="angular"');
    expect(markup).toContain('role="tab"');
  });

  it('keeps header content escaped and presentation separate from the preview', () => {
    const header = renderExampleHeader(example);
    const preview = renderExamplePreview(example);

    expect(header).toContain('<h3>Basic &lt;button&gt;</h3>');
    expect(header).toContain('One contract &amp; multiple framework surfaces.');
    expect(header).toContain('role="tablist"');
    expect(preview).toContain('data-vf-example-frame');
    expect(preview).toContain('title="Basic &lt;button&gt; preview"');
    expect(preview).toContain('sandbox="allow-scripts"');
  });

  it('renders reusable code controls and editor chrome with stable runtime hooks', () => {
    expect(renderExampleControls()).toContain('data-vf-example-code-toggle');

    const editor = renderExampleEditor(example);
    expect(editor).toContain('data-vf-example-run');
    expect(editor).toContain('data-vf-example-reset');
    expect(editor).toContain('data-vf-example-source');
    expect(editor).toContain('aria-label="Basic &lt;button&gt; code editor"');
    expect(editor).toContain('aria-live="polite"');
  });

  it('serializes example data without allowing an HTML script breakout', () => {
    const markup = renderExampleData({ ...example, description: '</script><script>alert(1)</script>' });

    expect(markup).toContain('data-vf-example-data');
    expect(markup).not.toContain('</script><script>alert(1)</script>');
    expect(markup).toContain('\\u003c/script>');
  });

  it('composes the complete documentation example from the reusable pieces', () => {
    const markup = renderDocumentationExample(example);

    expect(markup).toContain('class="vf-example"');
    expect(markup).toContain('data-vf-example-id="button/basic"');
    expect(markup).toContain('data-vf-example-default-framework="vue"');
    expect(markup).toContain('class="vf-example__header"');
    expect(markup).toContain('class="vf-example__preview"');
    expect(markup).toContain('class="vf-example__controls"');
    expect(markup).toContain('class="vf-example__editor"');
    expect(markup).toContain('data-vf-example-data');
  });
});
