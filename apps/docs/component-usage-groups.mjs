export const componentUsageGroups = Object.freeze([
  Object.freeze({ id: 'actions', title: 'Actions' }),
  Object.freeze({ id: 'form-controls', title: 'Form Controls' }),
  Object.freeze({ id: 'selection-choice', title: 'Selection & Choice' }),
  Object.freeze({ id: 'specialized-fields', title: 'Specialized Fields' }),
  Object.freeze({ id: 'navigation-menus', title: 'Navigation & Menus' }),
  Object.freeze({ id: 'layout-structure', title: 'Layout & Structure' }),
  Object.freeze({ id: 'content-disclosure', title: 'Content & Disclosure' }),
  Object.freeze({ id: 'overlays-feedback', title: 'Overlays & Feedback' }),
  Object.freeze({ id: 'utilities-accessibility', title: 'Utilities & Accessibility' }),
]);

const componentGroupById = new Map(componentUsageGroups.map((group) => [group.id, group]));

export function componentUsageGroup(groupId) {
  const group = componentGroupById.get(groupId);
  if (!group) throw new Error(`Unknown component documentation usage group: ${groupId ?? '<missing>'}`);
  return group;
}
