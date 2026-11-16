import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'side-nav',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/side-nav');
    await mkdir(dir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const sideNavCss = (await readFile(path.join(root, 'packages/web/dist/components/side-nav/side-nav.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
    await writeFile(path.join(dir, 'side-nav.css'), `${tokensCss}\n${sideNavCss}`);

    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><title>Side nav browser fixture</title><link rel="stylesheet" href="./side-nav.css"></head><body><main><h1>Side nav browser fixture</h1><nav data-vf-side-nav aria-label="Primary"><section data-vf-side-nav-group><h2 data-vf-side-nav-group-label>Workspace</h2><ul data-vf-side-nav-list><li data-vf-side-nav-item><a data-vf-side-nav-link data-vf-current="true" aria-current="page" href="./">Home</a></li><li data-vf-side-nav-item><a data-vf-side-nav-link href="./projects">Projects</a></li></ul></section></nav></main></body></html>`);

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection, signal } = await import('@angular/core');
      const { bootstrapApplication, provideClientHydration } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfSideNavDirective, VfSideNavGroupDirective, VfSideNavGroupLabelDirective, VfSideNavListDirective, VfSideNavItemDirective, VfSideNavLinkDirective } = await import('@vyrnforge/angular/side-nav');
      const imports = [VfSideNavDirective, VfSideNavGroupDirective, VfSideNavGroupLabelDirective, VfSideNavListDirective, VfSideNavItemDirective, VfSideNavLinkDirective];
      const template = `
        <nav vfSideNav aria-label="Primary">
          <section vfSideNavGroup>
            <h2 vfSideNavGroupLabel>Workspace</h2>
            <ul vfSideNavList>
              <li vfSideNavItem><a vfSideNavLink [vfSideNavCurrent]="true" href="./">Home</a></li>
              <li vfSideNavItem><a vfSideNavLink href="./projects">Projects</a></li>
            </ul>
          </section>
        </nav>
        <nav vfSideNav aria-label="Regression links">
          <ul vfSideNavList>
            <li vfSideNavItem><a vfSideNavLink aria-current="step" href="#destination" id="static-step">Static step</a></li>
            <li vfSideNavItem><a vfSideNavLink aria-current="page" [vfSideNavCurrent]="false" href="#destination" id="static-page">Static page</a></li>
            <li vfSideNavItem><a vfSideNavLink aria-current="location" [vfSideNavCurrent]="false" href="#destination" id="static-location">Static location</a></li>
            <li vfSideNavItem><a vfSideNavLink aria-current="false" href="#destination" id="static-false">Static false</a></li>
            <li vfSideNavItem><a vfSideNavLink href="#destination" id="static-absent">Static absent</a></li>
            <li vfSideNavItem><a vfSideNavLink aria-current="step" [vfSideNavCurrent]="override()" href="#destination" id="static-toggle">Static toggle</a></li>
            <li vfSideNavItem><a vfSideNavLink [attr.aria-current]="authored()" [vfSideNavCurrent]="override()" href="#destination" id="bound">Bound link</a></li>
          </ul>
        </nav>
        <button (click)="override.set(!override())">Toggle override</button>
        <button (click)="authored.set('location')">Author location</button>
        <button (click)="authored.set('page')">Author page</button>
        <button (click)="authored.set('step')">Author step</button>
        <button (click)="authored.set('false')">Author false</button>
        <button (click)="authored.set(null)">Remove authored</button>
        <div id="destination">Destination</div>
      `;
      class App {
        authored = signal('step');
        override = signal(false);
      }
      Component({ selector: 'vf-side-nav-test', standalone: true, imports, template })(App);
      const html = await renderApplication(
        (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection(), provideClientHydration()] }, context),
        { document: '<!doctype html><html lang="en"><head><title>Side nav browser fixture</title><link rel="stylesheet" href="./side-nav.css"></head><body><main><h1>Side nav browser fixture</h1><vf-side-nav-test></vf-side-nav-test></main></body></html>' },
      );
      await writeFile(path.join(dir, 'angular.html'), html.replace('</body>', '<script type="module" src="./angular.js"></script></body>'));
      const { build } = await import('esbuild');
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'angular-side-nav-client.ts',
          contents: `import '@angular/compiler'; import { Component, provideZonelessChangeDetection, signal } from '@angular/core'; import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser'; import { VfSideNavDirective, VfSideNavGroupDirective, VfSideNavGroupLabelDirective, VfSideNavListDirective, VfSideNavItemDirective, VfSideNavLinkDirective } from '@vyrnforge/angular/side-nav'; class App { authored = signal<string | null>('step'); override = signal(false); } Component({selector:'vf-side-nav-test',standalone:true,imports:[VfSideNavDirective,VfSideNavGroupDirective,VfSideNavGroupLabelDirective,VfSideNavListDirective,VfSideNavItemDirective,VfSideNavLinkDirective],template:${JSON.stringify(template)}})(App); bootstrapApplication(App,{providers:[provideZonelessChangeDetection(),provideClientHydration()]}).then(async app=>{await app.whenStable();document.documentElement.dataset.vfSideNavHydrated='true';});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'angular.js'),
      });
    }
  },
};
