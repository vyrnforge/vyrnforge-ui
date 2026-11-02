import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const outRoot = path.join(root, 'dist/docs');
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const channelRoot = path.join(outRoot, channel);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="VyrnForge documentation rebuild in progress">
  <title>VyrnForge Documentation</title>
</head>
<body>
  <main id="main">
    <h1>VyrnForge Documentation</h1>
    <p>The previous documentation surface has been removed while the documentation is rebuilt from the Native HTML surface first.</p>
  </main>
</body>
</html>`;

await rm(outRoot, { recursive: true, force: true });
await mkdir(channelRoot, { recursive: true });
await writeFile(path.join(channelRoot, 'index.html'), html);
await writeFile(
  path.join(channelRoot, 'site-manifest.json'),
  `${JSON.stringify({ channel, status: 'reset', pages: [{ slug: '', title: 'VyrnForge Documentation', framework: 'native-web' }] }, null, 2)}\n`
);
await writeFile(
  path.join(outRoot, 'index.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./${channel}/"><title>VyrnForge documentation</title></head><body><a href="./${channel}/">Open VyrnForge documentation</a></body></html>`
);

process.stdout.write(`documentation reset build -> ${path.relative(root, channelRoot)}\n`);
