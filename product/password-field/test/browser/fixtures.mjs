import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/browser-fixtures/components/password-field');
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><title>Password field browser fixture</title></head><body><main><h1>Password field browser fixture</h1><div><input id="password" type="password" aria-label="Password"><button id="toggle" type="button" aria-pressed="false" aria-label="Show password">Show</button></div></main><script>toggle.onclick=()=>{const visible=password.type==='password';password.type=visible?'text':'password';toggle.setAttribute('aria-pressed',String(visible));toggle.setAttribute('aria-label',visible?'Hide password':'Show password');toggle.textContent=visible?'Hide':'Show';}</script></body></html>`);

if (port === 'react') {
  const entry = path.join(root, 'product/password-field/examples/session-recovery/react.tsx');
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'browser', outdir: dir, entryNames: 'session-recovery-react' });
  await writeFile(path.join(dir, 'session-recovery-react.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Identity session recovery fixture</title><link rel="stylesheet" href="./session-recovery-react.css"><style>html,body{margin:0;min-block-size:100%;padding:1rem}</style></head><body><main><h1>Identity session recovery fixture</h1><div id="root"></div></main><script type="module" src="./session-recovery-react.js"></script></body></html>');
}
