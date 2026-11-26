// Presentation only: the authored sections and accessibility metadata stay in
// the compiler model for the future centralized accessibility reference.
export function isAccessibilitySection(heading) {
  return /^(?:(?:React|Native Web|Semantic layout and) )?accessibility(?:$|[ ,:])/i.test(heading);
}

// Never lose an executable example because its former section was retired.
export function visibleGuideSections(sections, examples = []) {
  return sections.flatMap(section => {
    if (!isAccessibilitySection(section.heading)) return [section];
    const hasExamples = examples.some(example => example.documentationSection === section.heading);
    const related = /related controls/i.test(section.heading);
    if (!hasExamples && !related) return [];
    return [{ ...section, sourceHeading: section.heading,
      heading: related ? 'Related controls' : 'Additional examples', blocks: [] }];
  });
}
