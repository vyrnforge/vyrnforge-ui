import { loadComponentStandards, summarizeComponentStandards } from '../accessibility/component-standards.mjs';
const requiredMapped = new Set(['button','tabs','dialog','combobox','listbox','menu','toolbar']);
const { standards } = await loadComponentStandards();
const byComponent = new Map(standards.map((entry) => [entry.component, entry]));
for (const component of requiredMapped) if (byComponent.get(component)?.reviewStatus !== 'mapped') throw new Error(`Representative accessibility mapping must remain mapped: ${component}`);
const summary = summarizeComponentStandards(standards);
if (summary.total !== standards.length) throw new Error('Accessibility standards summary does not match discovered component inventory');
process.stdout.write(`accessibility standards: ${summary.total} discovered components classified; ${summary.mapped} mapped; ${summary.reviewRequired} require review; ${summary.componentOwned} component-owned records\n`);
