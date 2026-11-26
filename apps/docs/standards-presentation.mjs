// Shared documentation copy, not accessibility classification or test evidence.
// Official criterion names and URLs remain owned by the compiler's projection.
// Short learning notes are illustrative; consult the linked W3C criterion for
// normative requirements and exceptions.
export const standardsCopy = Object.freeze({
  title: 'Accessibility standards',
  heading: 'References',
  scope: 'Always test accessibility in your own application.',
  reviewRequired: 'Accessibility still needs review.',
  baselineLabel: 'Structure',
});

export function criteriaHeading(count) {
  return count ? 'WCAG requirements (' + count + ')' : standardsCopy.baselineLabel;
}

const learningNotes = Object.freeze({
  '1.1.1': 'Add text alternatives to images and other meaningful non-text content.',
  '1.3.1': 'Make headings, labels and relationships clear to screen readers.',
  '1.3.2': 'Keep content in a meaningful reading order.',
  '1.4.1': 'Do not rely on color alone to communicate information.',
  '1.4.3': 'Make text easy to distinguish from its background.',
  '1.4.10': 'Keep content usable on small screens and when zoomed in.',
  '1.4.11': 'Make controls and important graphics easy to see.',
  '1.4.13': 'Let users dismiss and interact with additional content shown on hover or focus where required.',
  '2.1.1': 'Let users perform actions with a keyboard.',
  '2.1.2': 'Let users move keyboard focus away from a control.',
  '2.2.1': 'Let users adjust time limits where required.',
  '2.2.2': 'Let users pause, stop or hide moving or updating content where required.',
  '2.4.1': 'Let users skip repeated content.',
  '2.4.3': 'Keep the order of keyboard focus logical.',
  '2.4.4': 'Make it clear where a link leads or what it does.',
  '2.4.6': 'Use headings and labels that describe their purpose.',
  '2.4.7': 'Make it easy to see which control has keyboard focus.',
  '2.4.11': 'Keep the focused control from being completely hidden.',
  '2.5.3': 'Include the visible label in the name used by assistive technology.',
  '2.5.7': 'Offer a way to complete a drag action without dragging where required.',
  '2.5.8': 'Make buttons and other clickable areas large enough or well spaced.',
  '3.3.1': 'Explain what went wrong when a user enters invalid information.',
  '3.3.2': 'Provide clear labels and instructions for inputs.',
  '3.3.4': 'Let users check, correct or undo important submissions where required.',
  '3.3.8': 'Offer accessible ways to sign in without unnecessary memory or puzzle tasks.',
  '4.1.2': 'Help assistive technology identify controls, their purpose and current state.',
  '4.1.3': 'Let assistive technology announce updates without moving keyboard focus.',
});

export function criterionLearningNote(criterion) {
  // Do not imply a known WCAG edition or meaning for an unknown reference.
  return criterion.url?.startsWith('https://www.w3.org/WAI/WCAG22/Understanding/')
    ? learningNotes[criterion.id] ?? null : null;
}
