import { describe, expect, it } from 'vitest';
import { transform } from 'esbuild';
import { compileFrameworkDocumentation, parseMarkdownDocument } from './framework-documentation.mjs';

describe('Portable Markdown code examples', () => {
  it('compiles fenced TSX and import blocks as source, not visible backtick paragraphs', () => {
    const parsed = parseMarkdownDocument([
      '# React example',
      '',
      'A short introduction.',
      '',
      '## Setup',
      '',
      '\x60\x60\x60tsx',
      "import { Text } from '@vyrnforge/react/text';",
      '<Text as="h2" variant="heading-md">Heading</Text>',
      '\x60\x60\x60',
      '',
      'Use the semantic host.',
    ].join('\n'));
    expect(parsed.intro).toEqual([{ type: 'paragraph', text: 'A short introduction.' }]);
    expect(parsed.sections[0].blocks).toEqual([
      { type: 'code', language: 'tsx', text: "import { Text } from '@vyrnforge/react/text';\n<Text as=\"h2\" variant=\"heading-md\">Heading</Text>" },
      { type: 'paragraph', text: 'Use the semantic host.' },
    ]);
    expect(() => parseMarkdownDocument('# Example\n\n\x60\x60\x60tsx\nunterminated'))
      .toThrow('Unclosed fenced code block');
  });
});

describe('React documentation compiler preflight', () => {
  it('uses actual public React package exports and product-owned Button content', () => {
    const react = compileFrameworkDocumentation('react');
    const native = compileFrameworkDocumentation('native-web');
    const button = react.componentCatalog.find((component) => component.id === 'button');

    expect(button).toBeDefined();
    expect(react.packageName).toBe('@vyrnforge/react');
    expect(react.packageManifest.exports['./button']).toBeDefined();
    expect(button.publicEntrypoints).toContain('@vyrnforge/react/button');
    expect(button.showcaseAvailable).toBe(true);
    expect(button.apiAvailable).toBe(true);
    expect(react.componentShowcasePages.some((page) => page.id === 'button')).toBe(true);
    expect(react.componentApiPages.some((page) => page.id === 'button')).toBe(true);

    const nativeButton = native.componentCatalog.find((component) => component.id === 'button');
    expect(button.sharedSourcePath).toBe(nativeButton.sharedSourcePath);
    expect(button.sharedContent).toEqual(nativeButton.sharedContent);

    expect(button.frameworkSourcePath).toBe('product/components/interactive-controls/button/react/docs/index.md');
    expect(button.frameworkContent?.title).toBe('React Button');
    expect(button.frameworkContent?.sections.map((section) => section.heading))
      .toEqual(['React setup']);
    expect(JSON.stringify(button.frameworkContent)).toContain("@vyrnforge/react/button");
    expect(nativeButton.frameworkSourcePath).not.toBe(button.frameworkSourcePath);
  });

  it('parses the checked-in React Button examples without substituting Native Web HTML', async () => {
    const model = compileFrameworkDocumentation('react');
    const button = model.componentCatalog.find((component) => component.id === 'button');
    const examples = button.examples.filter((example) => ['button/basic', 'button/variants', 'button/sizes', 'button/states', 'button/forms'].includes(example.id));

    expect(examples).toHaveLength(5);
    for (const example of examples) {
      expect(example.language).toBe('tsx');
      expect(example.sourcePath).toMatch(/\/react\.tsx$/);
      expect(example.source).toContain("from '@vyrnforge/react/button'");
      expect(example.source).toContain('<Button');
      const compiled = await transform(example.source, { loader: 'tsx', format: 'esm', jsx: 'automatic', target: 'es2022' });
      expect(compiled.code).toContain('@vyrnforge/react/button');
    }
    expect(button.examples.every((example) => example.sourcePath.endsWith('/react.tsx'))).toBe(true);
  });

  it('does not invent an Elements Button API or guide for catalog symmetry', () => {
    const elements = compileFrameworkDocumentation('elements');
    expect(elements.componentCatalog.some((component) => component.id === 'button')).toBe(false);
  });
});

describe('Layout guide discovery and CSS-only responsibility', () => {
  it('builds one Native Web Flow/AutoGrid guide and does not invent framework layout entrypoints', () => {
    const native = compileFrameworkDocumentation('native-web');
    const layout = native.componentCatalog.find((owner) => owner.id === 'layout');
    expect(layout).toBeDefined();
    expect(layout.title).toBe('Layout');
    expect(layout.showcaseAvailable).toBe(true);
    expect(layout.apiAvailable).toBe(true);
    expect(layout.publicEntrypoints).toEqual(['@vyrnforge/web/styles/layout.css']);
    expect(layout.sharedSourcePath).toBe('product/components/composition-primitives/layout/docs/index.md');
    expect(layout.sharedContent.title).toBe('Layout: Flow & AutoGrid');
    const sections = new Set(layout.sharedContent.sections.map((section) => section.heading));
    for (const heading of [
      'Flow: vertical rhythm', 'Flow: one inline row', 'Flow: wrapping peers',
      'AutoGrid: intrinsic equal tracks', 'Semantic groups and forms', 'Dividers and thematic breaks',
      'Migration from older layout names', 'Accessibility, responsive behavior, and evidence',
    ]) expect(sections.has(heading)).toBe(true);
    expect(layout.examples.map((example) => example.id)).toEqual(expect.arrayContaining([
      'layout/basic', 'layout/flow-block', 'layout/flow-inline',
      'layout/flow-wrap', 'layout/auto-grid', 'layout/semantic-groups', 'layout/dividers',
    ]));
    for (const example of layout.examples) {
      expect(example.language).toBe('html');
      expect(example.sourcePath).toMatch(/\/native-web\.html$/);
      if (example.documentationSection) expect(sections.has(example.documentationSection)).toBe(true);
    }
    expect(layout.accessibility).toMatchObject({
      component: 'layout',
      reviewStatus: 'review-required',
      aria: { status: 'not-applicable' },
    });
    for (const framework of ['angular', 'vue', 'elements']) {
      const model = compileFrameworkDocumentation(framework);
      const cssGuide = model.componentCatalog.find((component) => component.id === 'layout');
      expect(cssGuide).toMatchObject({
        guideOnly: true, apiAvailable: false,
        cssRecipeStyle: '@vyrnforge/web/styles/layout.css',
        publicEntrypoints: [],
      });
      expect(model.componentApiPages.some((component) => component.id === 'layout')).toBe(false);
    }
  });
});

describe('React Layout components and shared CSS fallback across framework sources', () => {
  it('discovers actual public React Flow/AutoGrid components and product-owned use-case examples', async () => {
    const react = compileFrameworkDocumentation('react');
    const layout = react.componentCatalog.find((component) => component.id === 'layout');
    expect(layout).toMatchObject({
      kind: 'component', guideOnly: false, apiAvailable: true,
      cssRecipeStyle: null, publicEntrypoints: ['@vyrnforge/react/layout'],
    });
    expect(layout.frameworkSourcePath).toBe('product/components/composition-primitives/layout/react/docs/index.md');
    expect(layout.frameworkContent.title).toBe('React Layout');
    expect(layout.showcaseAvailable).toBe(true);
    expect(react.componentApiPages.some((component) => component.id === 'layout')).toBe(true);
    expect(layout.examples).toHaveLength(7);
    for (const example of layout.examples) {
      expect(example.sourcePath.endsWith('/react.tsx')).toBe(true);
      const compiled = await transform(example.source, { loader: 'tsx', jsx: 'automatic', target: 'es2022', format: 'esm' });
      expect(example.source).toContain("from '@vyrnforge/react/layout'");
      expect(compiled.code).toContain('@vyrnforge/react/layout');
    }
    const web = compileFrameworkDocumentation('native-web');
    expect(web.componentCatalog.find((component) => component.id === 'layout')?.apiAvailable).toBe(true);
  });
});

describe('Layout example ergonomics', () => {
  it('keeps all published Native Web and React layout examples free of per-instance inline CSS', () => {
    for (const framework of ['native-web', 'react']) {
      const model = compileFrameworkDocumentation(framework);
      const layout = model.componentCatalog.find((component) => component.id === 'layout');
      expect(layout.examples).toHaveLength(7);
      for (const example of layout.examples) {
        expect(example.source, example.sourcePath).not.toMatch(/\bstyle\s*=\s*(?:\{|["'])/);
      }
    }
  });

  it('documents semantic, undecorated lists rather than an invented card component', () => {
    for (const framework of ['native-web', 'react']) {
      const layout = compileFrameworkDocumentation(framework).componentCatalog.find((component) => component.id === 'layout');
      const grid = layout.examples.find((example) => example.id === 'layout/auto-grid');
      expect(grid.source).toMatch(framework === 'react' ? /<AutoGrid as="ul">/ : /<ul data-vf-auto-grid>/);
      expect(grid.source).toContain('<li');
      expect(grid.source).not.toMatch(/list-style\s*:\s*none|listStyle/);
    }
  });
});

describe('Layout accessibility reference links', () => {
  it('maps every Layout WCAG 2.2 criterion to a named official reference for Native and React', () => {
    const expected = [
      ['1.3.1', 'Info and Relationships', 'info-and-relationships'],
      ['1.3.2', 'Meaningful Sequence', 'meaningful-sequence'],
      ['1.4.10', 'Reflow', 'reflow'],
      ['2.1.1', 'Keyboard', 'keyboard'],
      ['2.4.3', 'Focus Order', 'focus-order'],
      ['2.4.7', 'Focus Visible', 'focus-visible'],
    ].map(([id, label, slug]) => ({
      id,
      label,
      url: `https://www.w3.org/WAI/WCAG22/Understanding/${slug}`,
    }));
    for (const framework of ['native-web', 'react']) {
      const layout = compileFrameworkDocumentation(framework).componentCatalog
        .find((component) => component.id === 'layout');
      expect(layout.standardReferences.criteria).toEqual(expected);
      expect(layout.standardReferences.reviewStatus).toBe('review-required');
    }
  });
});

describe('React Typography uses Native Web contracts for Text, Code and Kbd', () => {
  it('publishes Code and Kbd as real React public surfaces with authored React examples', async () => {
    const react = compileFrameworkDocumentation('react');
    const native = compileFrameworkDocumentation('native-web');
    for (const [id, imports] of [
      ['code', ['Code', 'CodeBlock']],
      ['kbd', ['Kbd']],
    ]) {
      const product = react.componentCatalog.find((component) => component.id === id);
      const baseline = native.componentCatalog.find((component) => component.id === id);
      expect(product).toBeDefined();
      expect(product.publicEntrypoints).toContain(`@vyrnforge/react/${id}`);
      expect(product.sharedContent).toEqual(baseline.sharedContent);
      expect(product.frameworkSourcePath).toBe(`product/components/elemental-primitives/typography/${id}/react/docs/index.md`);
      expect(product.examples).toHaveLength(1);
      const example = product.examples[0];
      expect(example.sourcePath).toBe(`product/components/elemental-primitives/typography/${id}/examples/basic/react.tsx`);
      expect(example.source).toContain(`from '@vyrnforge/react/${id}'`);
      for (const name of imports) expect(example.source).toContain(`<${name}`);
      expect(example.source).not.toContain("@vyrnforge/web/styles/");
      expect(example.source).toContain("from '@vyrnforge/react/text'");
      expect(example.source).toContain('<Text as="p">');
      if (id === 'code') {
        expect(example.source).not.toContain('<section>');
        expect(example.source).toContain("from '@vyrnforge/react/layout'");
        expect(example.source).toContain('<Flow gap="sm">');
      }
      const transformed = await transform(example.source, { loader: 'tsx', format: 'esm', jsx: 'automatic', target: 'es2022' });
      expect(transformed.code).toContain(`@vyrnforge/react/${id}`);
    }
    const text = react.componentCatalog.find((component) => component.id === 'text');
    expect(text.publicEntrypoints).toContain('@vyrnforge/react/text');
    expect(text.frameworkSourcePath).toBe('product/components/elemental-primitives/typography/text/react/docs/index.md');
    for (const id of ['text', 'code', 'kbd']) {
      const component = react.componentCatalog.find((entry) => entry.id === id);
      expect(component.frameworkContent.sections.find((section) => section.heading === 'React setup')).toBeDefined();
      expect(JSON.stringify(component.frameworkContent)).not.toContain('@vyrnforge/web/styles.css');
    }
  });
});

describe('React Text consumer-first guide examples', () => {
  it('discovers three real product-owned examples without duplicating the supported type scale', async () => {
    const model = compileFrameworkDocumentation('react');
    const text = model.componentCatalog.find((component) => component.id === 'text');
    const examples = text.examples.slice().sort((a, b) => a.id.localeCompare(b.id));
    expect(examples.map((example) => example.id)).toEqual([
      'text/basic', 'text/semantic-composition', 'text/type-scale',
    ]);
    expect(text.sharedContent.sections.map((section) => section.heading)).toContain('When to use');
    expect(text.sharedContent.sections.map((section) => section.heading)).toContain('When not to use');
    expect(text.frameworkContent.sections.map((section) => section.heading)).toEqual([
      'React setup', 'Choosing a semantic host',
    ]);
    expect(text.frameworkContent.sections.find((section) => section.heading === 'React setup')?.blocks
      .some((block) => block.type === 'code' && block.language === 'tsx' &&
        block.text.includes('<Text as="h2" variant="heading-md">'))).toBe(true);
    expect(text.frameworkContent.sections.find((section) => section.heading === 'Choosing a semantic host')?.blocks
      .some((block) => block.type === 'paragraph' && block.text.includes('as="h2"'))).toBe(true);
    for (const example of examples) {
      expect(example.sourcePath.endsWith('/react.tsx')).toBe(true);
      expect(example.source).toContain("from '@vyrnforge/react/text'");
      expect(example.source).not.toMatch(/\\bstyle\\s*=\\s*(?:\\{|["'])/);
      await expect(transform(example.source, {
        loader: 'tsx', format: 'esm', jsx: 'automatic', target: 'es2022',
      })).resolves.toHaveProperty('code');
    }
    const scale = examples.find((example) => example.id === 'text/type-scale');
    const roles = [
      'display-lg', 'display-md', 'display-sm',
      'heading-lg', 'heading-md', 'heading-sm', 'heading-xs',
      'title-lg', 'title-md', 'title-sm', 'body-lg', 'body-md', 'body-sm',
      'label-lg', 'label-md', 'label-sm', 'caption', 'overline',
    ];
    for (const role of roles) expect(scale.source).toContain("variant: '" + role + "'");
    expect(new Set(roles).size).toBe(18);
    const semantic = examples.find((example) => example.id === 'text/semantic-composition');
    for (const host of ['h2', 'p', 'strong', 'blockquote', 'time']) {
      expect(semantic.source).toContain('<Text as="' + host + '"');
    }
  });
});
