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
    for (const framework of ['react', 'angular', 'vue', 'elements']) {
      const model = compileFrameworkDocumentation(framework);
      expect(model.componentCatalog.some((component) => component.id === 'layout')).toBe(false);
    }
  });
});

describe('CSS-only layout guidance across framework sources', () => {
  it('discovers React TSX Layout guidance without inventing a React package layout API', async () => {
    const react = compileFrameworkDocumentation('react');
    const layout = react.componentCatalog.find((component) => component.id === 'layout');
    expect(layout).toMatchObject({
      kind: 'component', guideOnly: true, apiAvailable: false,
      cssRecipeStyle: '@vyrnforge/web/styles/layout.css', publicEntrypoints: [],
    });
    expect(layout.showcaseAvailable).toBe(true);
    expect(react.componentApiPages.some((component) => component.id === 'layout')).toBe(false);
    expect(layout.examples).toHaveLength(6);
    for (const example of layout.examples) {
      expect(example.sourcePath.endsWith('/react.tsx')).toBe(true);
      const compiled = await transform(example.source, { loader: 'tsx', jsx: 'automatic', target: 'es2022', format: 'esm' });
      expect(compiled.code).toContain('data-vf-');
    }
    const web = compileFrameworkDocumentation('native-web');
    expect(web.componentCatalog.find((component) => component.id === 'layout')?.apiAvailable).toBe(true);
  });
});
