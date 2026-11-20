import { describe, expect, it } from 'vitest';
import { transform } from 'esbuild';
import { compileFrameworkDocumentation } from './framework-documentation.mjs';

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
      .toEqual(['React setup', 'React props and ownership', 'React forms and accessibility', 'React rendering boundary']);
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
      'AutoGrid: intrinsic equal tracks', 'Semantic groups and forms',
      'Migration from older layout names', 'Accessibility, responsive behavior, and evidence',
    ]) expect(sections.has(heading)).toBe(true);
    expect(layout.examples.map((example) => example.id)).toEqual(expect.arrayContaining([
      'layout/basic', 'layout/flow-block', 'layout/flow-inline',
      'layout/flow-wrap', 'layout/auto-grid', 'layout/semantic-groups',
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
    expect(layout.examples).toHaveLength(6);
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
      expect(layout.examples).toHaveLength(6);
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
