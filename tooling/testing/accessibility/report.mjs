import { loadComponentStandards, renderComponentStandardsMatrix, summarizeComponentStandards } from './component-standards.mjs';
const { standards } = await loadComponentStandards();
if (process.argv.includes('--json')) process.stdout.write(`${JSON.stringify({ summary: summarizeComponentStandards(standards), components: standards }, null, 2)}\n`);
else process.stdout.write(`${renderComponentStandardsMatrix(standards)}\n`);
