import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertDocumentationCoverage } from './documentation-coverage.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const coverage = assertDocumentationCoverage(root);

process.stdout.write(
  `documentation coverage: ${coverage.cells.length} canonical component/framework cells complete; ` +
  `${coverage.legacyComponents.length} legacy component pages remain compatibility-projected\n`,
);
