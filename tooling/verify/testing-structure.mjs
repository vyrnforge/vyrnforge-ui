import { access } from 'node:fs/promises';
import { assertProductPreparation } from '../testing/discover-product-units.mjs';
import { createSemanticImpact } from '../impact/plan.mjs';

for (const file of ['tooling/testing/README.md', 'tooling/impact/README.md', 'tooling/impact/plan.mjs', 'tooling/README.md']) await access(file);

const impact = createSemanticImpact(['nx.json', 'tooling/verify/package-artifacts.mjs']);
if (impact.orchestration !== 'nx') throw new Error('Nx must remain the only task orchestrator');
if (!impact.repositoryWide || !impact.semanticEvidence.includes('package-artifacts') || !impact.semanticEvidence.includes('browser')) {
  throw new Error('semantic impact classification must retain repository-wide package and browser evidence');
}

const discovery = assertProductPreparation();
process.stdout.write(`testing structure: ${discovery.components.length} product components and ${discovery.ownedUnits.length} reusable scoped units prepared; repository testing infrastructure and Nx-owned impact classification are structurally valid\n`);
