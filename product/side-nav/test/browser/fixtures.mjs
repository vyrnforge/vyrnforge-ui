import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/browser-fixtures/components/side-nav');
await mkdir(dir, { recursive: true });

const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
const sideNavCss = (await readFile(path.join(root, 'packages/web/dist/components/side-nav/side-nav.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
await writeFile(path.join(dir, 'side-nav.css'), `${tokensCss}\n${sideNavCss}`);

await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><title>Side nav browser fixture</title><link rel="stylesheet" href="./side-nav.css"></head><body><main><h1>Side nav browser fixture</h1><nav data-vf-side-nav aria-label="Primary"><section data-vf-side-nav-group><h2 data-vf-side-nav-group-label>Workspace</h2><ul data-vf-side-nav-list><li data-vf-side-nav-item><a data-vf-side-nav-link data-vf-current="true" aria-current="page" href="./">Home</a></li><li data-vf-side-nav-item><a data-vf-side-nav-link href="./projects">Projects</a></li></ul></section></nav></main></body></html>`);
