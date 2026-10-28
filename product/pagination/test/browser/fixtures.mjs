import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/docs/next/pagination-fixtures');
await mkdir(dir, { recursive: true });

await writeFile(
  path.join(dir, `${port}.html`),
  '<!doctype html><html lang="en"><head><title>Pagination browser fixture</title></head><body><main><h1>Pagination browser fixture</h1><nav id="pagination" aria-label="Pagination"><a aria-label="Previous page" href="#page1">Previous</a><a href="#page2" aria-current="page">2</a><a aria-label="Next page" href="#page3">Next</a></nav></main></body></html>',
);

if (port === 'react') {
  await build({
    stdin: {
      contents: `
        import * as React from 'react';
        import { createRoot } from 'react-dom/client';
        import { PaginationItem, PaginationNext, PaginationPrevious, PaginationRoot } from '@vyrnforge/react/pagination';
        import '@vyrnforge/web/styles/pagination.css';

        function App() {
          return (
            <main>
              <h1>Public React Pagination fixture</h1>
              <PaginationRoot id="public-pagination">
                <PaginationPrevious href="#page1">Previous</PaginationPrevious>
                <PaginationItem href="#page2" current>2</PaginationItem>
                <PaginationNext href="#page3">Next</PaginationNext>
              </PaginationRoot>
            </main>
          );
        }

        createRoot(document.querySelector('#root')).render(<App />);
      `,
      resolveDir: root,
      loader: 'tsx',
      sourcefile: 'pagination-public-react.tsx',
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'public-react',
  });

  await writeFile(
    path.join(dir, 'public-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Public React Pagination fixture</title><link rel="stylesheet" href="./public-react.css"></head><body><div id="root"></div><script type="module" src="./public-react.js"></script></body></html>',
  );
}
