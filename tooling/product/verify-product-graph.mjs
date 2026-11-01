import { assertProductGraph } from './discover-product-graph.mjs';

const graph = assertProductGraph();
process.stdout.write(`product graph: ${graph.units.length} units, ${graph.components.length} components, ${graph.packages.length} public packages\n`);
