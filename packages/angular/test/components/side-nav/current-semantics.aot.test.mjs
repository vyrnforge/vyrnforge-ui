import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { readConfiguration, performCompilation, formatDiagnostics } from '@angular/compiler-cli';

test('Angular AOT strict templates accept authored ARIA alias and reject invalid input types', async () => {
  const root = process.cwd();
  await mkdir(path.join(root, 'dist'), { recursive: true });
  const dir = await mkdtemp(path.join(root, 'dist', 'side-nav-aot-'));
  try {
    const config = path.join(dir, 'tsconfig.json');
    const source = path.join(dir, 'app.ts');
    await writeFile(config, JSON.stringify({
      compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', experimentalDecorators: true, strict: true, skipLibCheck: true, noEmit: true, types: [] },
      angularCompilerOptions: { strictTemplates: true },
      files: ['app.ts'],
    }));
    const check = async template => {
      await writeFile(source, `
        import { Component, signal } from '@angular/core';
        import { VfSideNavLinkDirective } from '@vyrnforge/angular/side-nav';
        @Component({ selector: 'vf-proof', standalone: true, imports: [VfSideNavLinkDirective], template: ${JSON.stringify(template)} })
        export class App { authored = signal<string | null | undefined>('step'); current = signal(false); }
      `);
      const { rootNames, options, errors } = readConfiguration(config);
      assert.equal(errors.length, 0, formatDiagnostics(errors));
      const result = performCompilation({ rootNames, options, host: ts.createCompilerHost(options) });
      return result.diagnostics.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error);
    };
    const valid = await check('<a vfSideNavLink aria-current="step" href="/">Static</a><a vfSideNavLink [aria-current]="authored()" [vfSideNavCurrent]="current()" href="/">Bound</a><a data-vf-side-nav-link [attr.aria-current]="authored()" href="/">Native</a>');
    assert.equal(valid.length, 0, formatDiagnostics(valid));
    for (const template of [
      '<a vfSideNavLink [aria-current]="123" href="/">Invalid authored</a>',
      '<a vfSideNavLink [vfSideNavCurrent]="\'page\'" href="/">Invalid convenience</a>',
    ]) {
      const invalid = await check(template);
      assert.ok(invalid.some(d => d.code === 2322), formatDiagnostics(invalid) || 'expected strict template type error');
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
