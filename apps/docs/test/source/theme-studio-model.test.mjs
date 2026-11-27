import { describe, it, expect } from 'vitest';
import { defaultDraft, validateDraft, parseDraft, serializeDraft, historyReducer, importLegacyDraft, draftSchema } from '../../theme-studio-model.mjs';
const catalog = { 'color-accent-background': { color: true, description: 'Accent' }, 'space-md': { description: 'Spacing' } };
describe('Theme Studio portable draft', () => {
  it('round trips deterministically and rejects unknown versions, keys and unsafe values', () => {
    const draft = defaultDraft();
    draft.overrides.dark['color-accent-background'] = '#123456';
    draft.overrides.light['space-md'] = '2rem';
    expect(parseDraft(serializeDraft(draft, catalog), catalog)).toEqual(draft);
    expect(() => validateDraft({ ...draft, schemaVersion: 2 }, catalog)).toThrow('schemaVersion');
    expect(() => validateDraft({ ...draft, direction: 'rtl' }, catalog)).toThrow('unknown field');
    draft.overrides.light['space-md'] = 'url(https://example.com)';
    expect(() => validateDraft(draft, catalog)).toThrow('space-md');
  });
  it('migrates the bounded legacy palette and preserves independent shades', () => {
    const draft = importLegacyDraft(JSON.stringify({ palette: 'teal', appearance: 'dark', shade: '700', radius: 8, custom: {} }), catalog);
    expect(draft.shades).toEqual({ light: '600', dark: '700' });
    expect(importLegacyDraft('invalid', catalog)).toBeNull();
  });
  it('undoes, redoes and clears redo on divergent edits', () => {
    const initial = { past: [], present: defaultDraft(), future: [] };
    const edited = historyReducer(initial, { type: 'edit', update: draft => ({ ...draft, radius: 4 }) });
    const undone = historyReducer(edited, { type: 'undo' });
    expect(undone.present.radius).toBe(12);
    expect(historyReducer(undone, { type: 'redo' }).present.radius).toBe(4);
    expect(historyReducer(undone, { type: 'edit', update: draft => ({ ...draft, radius: 8 }) }).future).toEqual([]);
    expect(initial.present.radius).toBe(12);
  });
  it('derives schema IDs from the provided catalog', () => {
    const schema = draftSchema(catalog);
    expect(schema.properties.overrides.properties.light.properties['space-md'].description).toBe('Spacing');
    expect(schema.additionalProperties).toBe(false);
  });
});
