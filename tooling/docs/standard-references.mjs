// Portable documentation facts: product units supply accessibility.json;
// the docs compiler derives official reference links, not conformance claims.
const wcag22 = Object.freeze({
  '1.1.1': ['Non-text Content', 'non-text-content'],
  '1.3.1': ['Info and Relationships', 'info-and-relationships'],
  '1.4.1': ['Use of Color', 'use-of-color'],
  '1.4.3': ['Contrast (Minimum)', 'contrast-minimum'],
  '1.4.11': ['Non-text Contrast', 'non-text-contrast'],
  '1.4.13': ['Content on Hover or Focus', 'content-on-hover-or-focus'],
  '2.1.1': ['Keyboard', 'keyboard'],
  '2.1.2': ['No Keyboard Trap', 'no-keyboard-trap'],
  '2.2.1': ['Timing Adjustable', 'timing-adjustable'],
  '2.2.2': ['Pause, Stop, Hide', 'pause-stop-hide'],
  '2.4.1': ['Bypass Blocks', 'bypass-blocks'],
  '2.4.3': ['Focus Order', 'focus-order'],
  '2.4.4': ['Link Purpose (In Context)', 'link-purpose-in-context'],
  '2.4.6': ['Headings and Labels', 'headings-and-labels'],
  '2.4.7': ['Focus Visible', 'focus-visible'],
  '2.4.11': ['Focus Not Obscured (Minimum)', 'focus-not-obscured-minimum'],
  '2.5.3': ['Label in Name', 'label-in-name'],
  '2.5.7': ['Dragging Movements', 'dragging-movements'],
  '2.5.8': ['Target Size (Minimum)', 'target-size-minimum'],
  '3.3.1': ['Error Identification', 'error-identification'],
  '3.3.2': ['Labels or Instructions', 'labels-or-instructions'],
  '3.3.4': ['Error Prevention (Legal, Financial, Data)', 'error-prevention-legal-financial-data'],
  '3.3.8': ['Accessible Authentication (Minimum)', 'accessible-authentication-minimum'],
  '4.1.2': ['Name, Role, Value', 'name-role-value'],
  '4.1.3': ['Status Messages', 'status-messages'],
});

const html = 'https://html.spec.whatwg.org/multipage/';
const nativeLinks = Object.freeze({
  button: ['HTML button', html + 'form-elements.html#the-button-element'],
  input: ['HTML input', html + 'input.html#the-input-element'],
  select: ['HTML select', html + 'form-elements.html#the-select-element'],
  textarea: ['HTML textarea', html + 'form-elements.html#the-textarea-element'],
  a: ['HTML link', html + 'text-level-semantics.html#the-a-element'],
  img: ['HTML image', html + 'embedded-content.html#the-img-element'],
  svg: ['SVG', 'https://www.w3.org/TR/SVG2/struct.html#SVGElement'],
  kbd: ['HTML kbd', html + 'text-level-semantics.html#the-kbd-element'],
  code: ['HTML code', html + 'text-level-semantics.html#the-code-element'],
  pre: ['HTML pre', html + 'grouping-content.html#the-pre-element'],
  dialog: ['HTML dialog', html + 'interactive-elements.html#the-dialog-element'],
});

function nativeReferenceLinks(nativeBaseline) {
  if (nativeBaseline?.kind !== 'native') return [];
  const reference = nativeBaseline.reference ?? '';
  let keys = [];
  if (reference === 'button' || reference.startsWith('button with ')) keys = ['button'];
  else if (reference === 'input' || reference.startsWith('input[')) keys = ['input'];
  else if (reference === 'textarea') keys = ['textarea'];
  else if (reference === 'select') keys = ['select'];
  else if (reference === 'a[href]') keys = ['a'];
  else if (reference === 'img' || reference === 'svg' || reference === 'kbd') keys = [reference];
  else if (reference === 'code and pre') keys = ['code', 'pre'];
  else if (reference === 'dialog + showModal()') keys = ['dialog'];
  return keys.map((key) => ({ label: nativeLinks[key][0], url: nativeLinks[key][1] }));
}

function criteriaForTarget(target, criteria) {
  const wcag22Target = /^2\.2(?:\s|$)/.test(target ?? '');
  return (Array.isArray(criteria) ? criteria : []).map((id) => {
    const reference = wcag22Target ? wcag22[id] : null;
    return {
      id,
      label: reference ? reference[0] : null,
      url: reference ? 'https://www.w3.org/WAI/WCAG22/Understanding/' + reference[1] : null,
    };
  });
}

export function deriveAccessibilityReferences(accessibility) {
  if (!accessibility) return null;
  const target = accessibility.wcag?.target ?? null;
  const standards = nativeReferenceLinks(accessibility.nativeBaseline);
  if (target) {
    standards.push({
      label: 'WCAG ' + target + ' (target)',
      url: /^2\.2(?:\s|$)/.test(target) ? 'https://www.w3.org/TR/WCAG22/' : null,
    });
  }
  // These links provide background guidance even when the recorded ARIA
  // status is 'not-applicable'; they are not a claim that ARIA is required.
  standards.push(
    { label: 'ARIA in HTML', url: 'https://www.w3.org/TR/html-aria/' },
    { label: 'WAI-ARIA 1.2', url: 'https://www.w3.org/TR/wai-aria-1.2/' },
  );
  return {
    standards,
    criteria: criteriaForTarget(target, accessibility.wcag?.criteria),
    nativeBaseline: accessibility.nativeBaseline?.reference ?? null,
    mappingStatus: accessibility.wcag?.status ?? 'not recorded',
    reviewStatus: accessibility.reviewStatus ?? 'not recorded',
  };
}
