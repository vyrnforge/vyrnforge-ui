/**
 * In React consumer guides shared semantics stay shared, while Native Web
 * fenced markup is illustrated on the Native Web documentation route.
 * Styling/token examples remain valid where applicable.
 */
export function reactConsumerBlocks(blocks = []) {
  return blocks.filter((block) => !(block.type === 'code' && block.language === 'html'));
}

export function reactConsumerSections(guide) {
  return guide.sections.filter((section) => !/^Native Web (?:usage|markup|example|customization)/i.test(section.heading));
}
