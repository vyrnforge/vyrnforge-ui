// Documentation presets: palette shades are authoring inputs, never public UI tokens.
// The v1 recipes are compatibility inputs: change them only with a schema migration.
export const presets = [
  { id: 'blue', label: 'Blue', shades: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#245edb', 700: '#1c4fb8',
    800: '#173f8f', 900: '#0b1f4d', 950: '#07142e',
  } },
  { id: 'teal', label: 'Teal', shades: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
    400: '#2dd4bf', 500: '#14b8a6', 600: '#0f766e', 700: '#115e59',
    800: '#134e4a', 900: '#083c38', 950: '#042f2e',
  } },
  { id: 'violet', label: 'Violet', shades: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
    400: '#a78bfa', 500: '#8b5cf6', 600: '#6d28d9', 700: '#5b21b6',
    800: '#4c1d95', 900: '#2e1065', 950: '#1e0c43',
  } },
  { id: 'rose', label: 'Rose', shades: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
    400: '#fb7185', 500: '#f43f5e', 600: '#be123c', 700: '#9f1239',
    800: '#881337', 900: '#4c0519', 950: '#2b0310',
  } },
  { id: 'amber', label: 'Amber', shades: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#b45309', 700: '#92400e',
    800: '#78350f', 900: '#451a03', 950: '#301202',
  } },
];


// Documentation-owned, framework-neutral draft. Canonical token IDs are
// supplied from the admitted shared catalog; no second token-value source.
export const modes = ['light', 'dark'];
export const validSlug = name => typeof name === 'string' && name.length <= 80 &&
  /^[a-z][a-z0-9-]*$/.test(name) && !['light', 'dark', 'system'].includes(name);
export const validHex = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
export const defaultDraft = () => ({
  schemaVersion: 1, name: 'my-brand', preset: 'blue',
  shades: { light: '600', dark: '300' }, paletteOverrides: {}, radius: 12,
  overrides: { light: {}, dark: {} },
});
const isMap = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const ownKeys = (value, allowed, path) => {
  if (!isMap(value)) throw new TypeError(path + ' must be an object');
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new TypeError(path + '.' + key + ': unknown field');
  }
};
const fail = message => { throw new TypeError(message); };
// This intentionally accepts a constrained text-value authoring subset, not
// arbitrary CSS. CSS URLs, escapes, declarations and external references are
// excluded from imported previews. Semantic colors use six-digit hex.
export const safeTokenValue = value => typeof value === 'string' && value.length <= 256 &&
  !!value.trim() && /^[a-z0-9#.,%() +*/'"-]+$/i.test(value) &&
  !/\/\*|\*\/|(?:url|image|image-set|cross-fade|element|paint|attr|env|var)\s*\(/i.test(value) &&
  !/[\r\n]/.test(value);
// V1 intentionally admits a portable, bounded authoring subset. The library
// itself continues to accept its documented CSS values without this editor policy.
const lengthPattern = '(?:0|(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:px|rem|em|ch|%|vw|vh))';
const numericPattern = '(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)';
const patterns = {
  color: '^#[0-9a-fA-F]{6}
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!permittedValue(catalog[id], value)) {
        fail('theme.overrides.' + mode + '.' + id + ': expected ' + permittedHint(catalog[id]));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { type: 'string', minLength: 1, maxLength: 256, pattern: patterns[valueType(entry)], description: entry.description + '. ' + permittedHint(entry) }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  paint: '^(?:#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?|transparent)
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  dimension: '^' + lengthPattern + '
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  'letter-spacing': '^(?:normal|-?' + lengthPattern + ')
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  'font-weight': '^(?:[1-9][0-9]{0,2}|1000)
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  number: '^' + numericPattern + '
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  duration: '^(?:0|' + numericPattern + '(?:ms|s))
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  easing: '^(?:linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\\( *-?' + numericPattern + ' *, *-?' + numericPattern + ' *, *-?' + numericPattern + ' *, *-?' + numericPattern + ' *\\))
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  'font-family': '^(?:"[^"]+"|\\x27[^\\x27]+\\x27|[a-zA-Z0-9 -]+)(?: *, *(?:"[^"]+"|\\x27[^\\x27]+\\x27|[a-zA-Z0-9 -]+))*
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  font: '^(?:(?:normal|italic|oblique|[1-9][0-9]{0,2}|1000) +)*' + lengthPattern + '(?:/(?:' + numericPattern + '|' + lengthPattern + '))? +[a-zA-Z0-9"\\x27 ,\\-]+
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
  shadow: '^(?:none|(?:inset +)?-?' + lengthPattern + ' +-?' + lengthPattern + '(?: +' + lengthPattern + ')?(?: +-?' + lengthPattern + ')? +(?:#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?|rgb\\([0-9. /,%]+\\)|rgba\\([0-9. ,%]+\\)))
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
,
};
export const valueType = entry => entry.color ? 'color' : entry.valueType ?? 'dimension';
export function permittedValue(entry, value) {
  if (!safeTokenValue(value) || value !== value.trim()) return false;
  const type = valueType(entry);
  const pattern = patterns[type];
  if (!pattern || !new RegExp(pattern).test(value)) return false;
  if (type === 'easing' && value.startsWith('cubic-bezier')) {
    const numbers = value.slice(13, -1).split(',').map(Number);
    return numbers[0] >= 0 && numbers[0] <= 1 && numbers[2] >= 0 && numbers[2] <= 1;
  }
  return type !== 'number' || Number(value) > 0;
}
export function permittedHint(entry) {
  return ({ color: '#RRGGBB', paint: '#RRGGBB, #RRGGBBAA or transparent',
    dimension: 'Nonnegative length (e.g. 8px, 1rem, 50%)',
    'letter-spacing': 'Length, including negative values, or normal',
    'font-weight': 'Weight from 1–1000', number: 'Positive number (e.g. 1.5)',
    duration: 'Nonnegative duration (e.g. 120ms, 0.2s)',
    easing: 'Named easing or cubic-bezier(x1, y1, x2, y2)',
    'font-family': 'Comma-separated font names (e.g. system-ui, sans-serif)',
    font: 'Font shorthand (e.g. 500 1rem/1.5 system-ui)',
    shadow: 'none or a single shadow (e.g. 0 2px 8px #00000033)',
  })[valueType(entry)];
}
export function validateDraft(input, catalog) {
  ownKeys(input, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides'], 'theme');
  if (input.schemaVersion !== 1) fail('theme.schemaVersion: expected version 1; unsupported versions cannot be imported');
  if (!validSlug(input.name)) fail('theme.name: use a lowercase slug, excluding light, dark and system');
  const preset = presets.find(p => p.id === input.preset);
  if (!preset) fail('theme.preset: choose a supported preset');
  const levels = Object.keys(preset.shades);
  ownKeys(input.shades, modes, 'theme.shades');
  ownKeys(input.paletteOverrides, levels, 'theme.paletteOverrides');
  ownKeys(input.overrides, modes, 'theme.overrides');
  if (!Number.isInteger(input.radius) || input.radius < 0 || input.radius > 24) fail('theme.radius: expected an integer from 0 to 24');
  for (const mode of modes) {
    if (!levels.includes(input.shades[mode])) fail('theme.shades.' + mode + ': unknown shade');
    ownKeys(input.overrides[mode], Object.keys(catalog), 'theme.overrides.' + mode);
    for (const [id, value] of Object.entries(input.overrides[mode])) {
      if (!(catalog[id].color ? validHex(value) : safeTokenValue(value))) {
        fail('theme.overrides.' + mode + '.' + id + ': ' + (catalog[id].color ? 'expected #RRGGBB' : 'expected a safe, nonempty CSS value without URL or variable references'));
      }
    }
  }
  for (const [shade, value] of Object.entries(input.paletteOverrides)) {
    if (!validHex(value)) fail('theme.paletteOverrides.' + shade + ': expected #RRGGBB');
  }
  const ordered = map => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { schemaVersion: 1, name: input.name, preset: input.preset,
    shades: { light: input.shades.light, dark: input.shades.dark },
    paletteOverrides: ordered(input.paletteOverrides), radius: input.radius,
    overrides: { light: ordered(input.overrides.light), dark: ordered(input.overrides.dark) } };
}
export function parseDraft(text, catalog) {
  if (typeof text !== 'string' || text.length > 100000) fail('Theme JSON exceeds 100,000 characters');
  let input;
  try { input = JSON.parse(text); } catch { fail('Invalid JSON: check quotes, commas and braces'); }
  return validateDraft(input, catalog);
}
export function serializeDraft(draft, catalog) {
  return JSON.stringify(validateDraft(draft, catalog), null, 2);
}
export function importLegacyDraft(raw, catalog) {
  if (!raw || raw.length > 1600) return null;
  try {
    const input = JSON.parse(raw);
    if (!modes.includes(input.appearance)) return null;
    return validateDraft({ ...defaultDraft(), preset: input.palette, radius: input.radius,
      shades: { ...defaultDraft().shades, [input.appearance]: input.shade },
      paletteOverrides: input.custom }, catalog);
  } catch { return null; }
}
export function historyReducer(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1),
      future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0],
      future: state.future.slice(1) };
  }
  if (action.type === 'replace') {
    return { past: [], present: action.draft, future: [] };
  }
  if (action.type !== 'edit') return state;
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}
export function draftSchema(catalog) {
  const levels = Object.keys(presets[0].shades);
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const hex = { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' };
  const overrides = object(Object.fromEntries(Object.entries(catalog).map(([id, entry]) =>
    [id, { ...(entry.color ? hex : { type: 'string', minLength: 1, maxLength: 256 }), description: entry.description }])));
  return { $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'VyrnForge Theme Studio draft v1', ...object({
      schemaVersion: { const: 1 }, name: { type: 'string', maxLength: 80, pattern: '^[a-z][a-z0-9-]*$', not: { enum: ['light','dark','system'] } },
      preset: { enum: presets.map(p => p.id) },
      shades: object({ light: { enum: levels }, dark: { enum: levels } }, modes),
      paletteOverrides: object(Object.fromEntries(levels.map(level => [level, hex]))),
      radius: { type: 'integer', minimum: 0, maximum: 24 },
      overrides: object({ light: overrides, dark: overrides }, modes),
    }, ['schemaVersion','name','preset','shades','paletteOverrides','radius','overrides']) };
}
