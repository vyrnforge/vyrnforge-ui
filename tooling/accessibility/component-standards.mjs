import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

const reviewStatuses = new Set(['mapped', 'review-required']);
const nativeKinds = new Set(['native', 'composite', 'structural', 'utility', 'review-required']);
const semanticStatuses = new Set(['mapped', 'review-required', 'not-applicable']);
const evidenceStatuses = new Set(['required', 'review-required', 'not-applicable', 'existing-pending']);
const formStatuses = new Set(['native', 'review-required', 'not-applicable']);
const visualStatuses = new Set(['shared-foundation', 'component-specific', 'review-required', 'not-applicable']);
const ssrStatuses = new Set(['native', 'contract-required', 'review-required', 'not-applicable']);

function assertStringArray(value, label, { allowEmpty = true } = {}) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string' || entry.length === 0) || (!allowEmpty && value.length === 0)) throw new Error(`${label} must be ${allowEmpty ? 'a' : 'a non-empty'} string array`);
}
function assertStatus(value, allowed, label) { if (!allowed.has(value)) throw new Error(`${label} has unsupported value ${JSON.stringify(value)}`); }

export function unresolvedComponentStandard(component) {
  return {
    schemaVersion: 1, component, reviewStatus: 'review-required',
    nativeBaseline: { kind: 'review-required', reference: 'review-required' },
    wcag: { target: '2.2 AA', status: 'review-required', criteria: [] },
    aria: { status: 'review-required', apgPattern: null },
    interaction: { keyboard: 'review-required', focus: 'review-required', directionality: 'review-required' },
    ownership: { library: ['review-required'], consumer: ['review-required'] },
    forms: { status: 'review-required' }, visualAccessibility: { status: 'review-required' }, ssrHydration: { status: 'review-required' },
    evidence: { browser: 'review-required', assistiveTechnology: 'review-required' }, profileVariability: [],
    notes: ['Automatically classified as review-required until the owning component adds accessibility.json.'], classificationSource: 'derived-placeholder'
  };
}

export function validateComponentStandard(standard, component) {
  const prefix = `components/${component}/accessibility.json`;
  if (!standard || typeof standard !== 'object' || Array.isArray(standard)) throw new Error(`${prefix} must contain an object`);
  if (standard.schemaVersion !== 1) throw new Error(`${prefix} must use schemaVersion 1`);
  if (standard.component !== component) throw new Error(`${prefix} component must equal ${component}`);
  assertStatus(standard.reviewStatus, reviewStatuses, `${prefix} reviewStatus`);
  if (!standard.nativeBaseline || typeof standard.nativeBaseline.reference !== 'string') throw new Error(`${prefix} must define nativeBaseline.reference`);
  assertStatus(standard.nativeBaseline.kind, nativeKinds, `${prefix} nativeBaseline.kind`);
  if (!standard.wcag || standard.wcag.target !== '2.2 AA') throw new Error(`${prefix} must target WCAG 2.2 AA`);
  assertStatus(standard.wcag.status, reviewStatuses, `${prefix} wcag.status`); assertStringArray(standard.wcag.criteria, `${prefix} wcag.criteria`);
  if (!standard.aria || !('apgPattern' in standard.aria)) throw new Error(`${prefix} must define aria.apgPattern`);
  assertStatus(standard.aria.status, semanticStatuses, `${prefix} aria.status`);
  if (standard.aria.apgPattern !== null && (typeof standard.aria.apgPattern !== 'string' || standard.aria.apgPattern.length === 0)) throw new Error(`${prefix} aria.apgPattern must be null or a non-empty string`);
  for (const key of ['keyboard', 'focus', 'directionality']) if (!standard.interaction || typeof standard.interaction[key] !== 'string' || standard.interaction[key].length === 0) throw new Error(`${prefix} interaction.${key} must be a non-empty string`);
  if (!standard.ownership) throw new Error(`${prefix} must define ownership`);
  assertStringArray(standard.ownership.library, `${prefix} ownership.library`, { allowEmpty: false }); assertStringArray(standard.ownership.consumer, `${prefix} ownership.consumer`, { allowEmpty: false });
  assertStatus(standard.forms?.status, formStatuses, `${prefix} forms.status`); assertStatus(standard.visualAccessibility?.status, visualStatuses, `${prefix} visualAccessibility.status`); assertStatus(standard.ssrHydration?.status, ssrStatuses, `${prefix} ssrHydration.status`);
  assertStatus(standard.evidence?.browser, evidenceStatuses, `${prefix} evidence.browser`); assertStatus(standard.evidence?.assistiveTechnology, evidenceStatuses, `${prefix} evidence.assistiveTechnology`);
  assertStringArray(standard.profileVariability, `${prefix} profileVariability`); assertStringArray(standard.notes, `${prefix} notes`);
  if (standard.reviewStatus === 'mapped') {
    if (standard.wcag.status !== 'mapped' || standard.wcag.criteria.length === 0) throw new Error(`${prefix} mapped records must identify mapped WCAG responsibilities`);
    const unresolved = [standard.nativeBaseline.kind, standard.aria.status, standard.interaction.keyboard, standard.interaction.focus, standard.interaction.directionality, standard.forms.status, standard.visualAccessibility.status, standard.ssrHydration.status, standard.evidence.browser, standard.evidence.assistiveTechnology, ...standard.ownership.library, ...standard.ownership.consumer].includes('review-required');
    if (unresolved) throw new Error(`${prefix} mapped records cannot contain review-required fields`);
  }
  return { ...standard, classificationSource: 'component-owned' };
}

export async function loadComponentStandards(root = process.cwd()) {
  const discovery = discoverProductUnits(root); const standards = [];
  for (const entry of discovery.components) {
    const component = entry.component; const file = path.join(root, 'components', component, 'accessibility.json');
    try { standards.push(validateComponentStandard(JSON.parse(await readFile(file, 'utf8')), component)); }
    catch (error) { if (error?.code === 'ENOENT') standards.push(unresolvedComponentStandard(component)); else throw error; }
  }
  return { discovery, standards };
}
export function summarizeComponentStandards(standards) {
  return { total: standards.length, mapped: standards.filter((entry) => entry.reviewStatus === 'mapped').length, reviewRequired: standards.filter((entry) => entry.reviewStatus === 'review-required').length, componentOwned: standards.filter((entry) => entry.classificationSource === 'component-owned').length };
}
export function renderComponentStandardsMatrix(standards) {
  const rows = [...standards].sort((a,b)=>a.component.localeCompare(b.component)).map((entry)=>[entry.component,entry.reviewStatus,entry.classificationSource,`${entry.nativeBaseline.kind}: ${entry.nativeBaseline.reference}`,entry.aria.apgPattern ?? '—',entry.interaction.keyboard,entry.interaction.focus,entry.evidence.assistiveTechnology,entry.profileVariability.join(', ') || '—']);
  return ['# VyrnForge component accessibility standards matrix','', '> Mapping status is not a WCAG conformance claim. A derived `review-required` row means the component has not yet completed standards/evidence mapping.','', '| Component | Mapping | Source | Native baseline | APG pattern | Keyboard | Focus | AT evidence | Profile variability |','| --- | --- | --- | --- | --- | --- | --- | --- | --- |',...rows.map((row)=>`| ${row.map((value)=>String(value).replaceAll('|','\\|')).join(' | ')} |`),''].join('\n');
}
