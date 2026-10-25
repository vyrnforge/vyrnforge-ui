export const componentUsageGroups = [
  {
    id: 'actions',
    title: 'Actions',
    components: ['button', 'split-button', 'toggle-button', 'toolbar']
  },
  {
    id: 'form-controls',
    title: 'Form Controls',
    components: ['checkbox', 'color-input', 'file-input', 'input', 'native-select', 'number-input', 'radio', 'slider', 'switch', 'temporal-input', 'textarea']
  },
  {
    id: 'selection-choice',
    title: 'Selection & Choice',
    components: ['combobox', 'listbox', 'multi-select', 'range-slider', 'rating', 'segmented-control', 'select', 'tag-group', 'toggle-group']
  },
  {
    id: 'specialized-fields',
    title: 'Specialized Fields',
    components: ['color-picker', 'file-uploader', 'number-field', 'otp-field', 'password-field', 'search-field', 'temporal-field']
  },
  {
    id: 'navigation-menus',
    title: 'Navigation & Menus',
    components: ['context-menu', 'link', 'menu', 'menubar', 'pagination', 'side-nav', 'tabs']
  },
  {
    id: 'layout-structure',
    title: 'Layout & Structure',
    components: ['app-shell', 'elemental-primitives', 'layout', 'separator', 'split-panel', 'surface']
  },
  {
    id: 'content-disclosure',
    title: 'Content & Disclosure',
    components: ['accordion', 'carousel', 'disclosure', 'icon', 'text']
  },
  {
    id: 'overlays-feedback',
    title: 'Overlays & Feedback',
    components: ['alert-dialog', 'dialog', 'drawer', 'popover', 'preview-card', 'toast', 'tooltip']
  },
  {
    id: 'utilities-accessibility',
    title: 'Utilities & Accessibility',
    components: ['portal', 'presence', 'visually-hidden']
  }
];

const componentGroupById = new Map();
for (const group of componentUsageGroups) {
  for (const component of group.components) {
    if (componentGroupById.has(component)) throw new Error(`Component ${component} appears in more than one documentation usage group`);
    componentGroupById.set(component, { id: group.id, title: group.title });
  }
}

const fallbackGroup = { id: 'other', title: 'Other' };

export function componentUsageGroup(component) {
  return componentGroupById.get(component) ?? fallbackGroup;
}
