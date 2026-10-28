import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../dist/docs/', import.meta.url)));
const host = '127.0.0.1';
const port = Number(process.env.VYRNFORGE_DOCS_PORT || 4173);
const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${host}:${port}`);
    const decoded = decodeURIComponent(url.pathname);
    const candidate = path.resolve(root, `.${decoded}`);
    if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== root) throw new Error('invalid path');
    let file = candidate;
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) file = path.join(file, 'index.html');
    const fileInfo = await stat(file).catch(() => null);
    if (!fileInfo?.isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': types.get(path.extname(file)) || 'application/octet-stream', 'cache-control': 'no-store' });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
  }
}).listen(port, host, () => process.stdout.write(`docs server: http://${host}:${port}/next/\n`));
