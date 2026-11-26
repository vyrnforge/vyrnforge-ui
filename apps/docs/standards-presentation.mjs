// Shared documentation copy, not accessibility classification or test evidence.
// Official criterion names and URLs remain owned by the compiler's projection.
// Short learning notes are illustrative; consult the linked W3C criterion for
// normative requirements and exceptions.
export const standardsCopy = Object.freeze({
  title: 'Accessibility standards',
  heading: 'Reference standards',
  introduction: 'These specifications explain native HTML semantics, web accessibility requirements (WCAG), and accessibility information exposed to assistive technologies (ARIA).',
  criteriaIntroduction: 'Each success criterion links to the official W3C explanation. The short descriptions are learning aids, not complete requirements.',
  mappingLabel: 'Mapping status',
  scope: 'A standards mapping identifies relevant requirements. It does not demonstrate conformance; evaluate the implementation and how it is used.',
  reviewRequired: 'Accessibility review required.',
  baselineLabel: 'Semantic baseline',
});

export function criteriaHeading(count) {
  return count ? 'WCAG success criteria (' + count + ')' : 'Semantic baseline';
}

export function mappingLabel(status) {
  if (!status) return 'Not recorded';
  const label = String(status).replaceAll('-', ' ');
  return label[0].toUpperCase() + label.slice(1);
}

const learningNotes = Object.freeze({
  '1.1.1': 'Provide text alternatives for meaningful non-text content.',
  '1.3.1': 'Make structure and relationships available to assistive technologies.',
  '1.3.2': 'Preserve the reading order when sequence affects meaning.',
  '1.4.1': 'Communicate important information without relying on color alone.',
  '1.4.3': 'Keep text sufficiently distinct from its background.',
  '1.4.10': 'Allow content to adapt to narrow or magnified views.',
  '1.4.11': 'Keep essential control indicators and graphics distinguishable.',
  '1.4.13': 'Make additional hover or focus content usable and dismissible where required.',
  '2.1.1': 'Support keyboard operation of functionality.',
  '2.1.2': 'Allow keyboard users to move focus away from a component.',
  '2.2.1': 'Let users adjust time limits where required.',
  '2.2.2': 'Provide controls for relevant moving or automatically updating content.',
  '2.4.1': 'Provide a way to skip repeated content.',
  '2.4.3': 'Keep keyboard focus order meaningful.',
  '2.4.4': 'Make the purpose of each link clear from its text or context.',
  '2.4.6': 'Use descriptive headings and labels.',
  '2.4.7': 'Make keyboard focus visually apparent.',
  '2.4.11': 'Avoid completely obscuring the focused control.',
  '2.5.3': 'Include visible label text in the accessible name.',
  '2.5.7': 'Offer a non-dragging pointer alternative where required.',
  '2.5.8': 'Provide adequately sized or spaced pointer targets.',
  '3.3.1': 'Identify detected input errors and describe them in text.',
  '3.3.2': 'Provide labels or instructions when input is expected.',
  '3.3.4': 'Help users prevent serious submission errors through review, correction, or reversal.',
  '3.3.8': 'Avoid requiring cognitive tests to authenticate without an applicable alternative or assistance.',
  '4.1.2': 'Expose control names, roles, states and values programmatically.',
  '4.1.3': 'Expose status updates to assistive technologies without moving focus.',
});

export function criterionLearningNote(criterion) {
  // Do not imply a known WCAG edition or meaning for an unknown reference.
  return criterion.url?.startsWith('https://www.w3.org/WAI/WCAG22/Understanding/')
    ? learningNotes[criterion.id] ?? null : null;
}
