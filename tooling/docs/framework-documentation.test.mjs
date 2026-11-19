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
