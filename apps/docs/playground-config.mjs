/**
 * Documentation-only, framework-neutral field metadata.
 * @typedef {string | boolean | number} Value
 * @typedef {Record<string, Value>} Configuration
 * @typedef {{key: string, label: string, description?: string, default: Value,
 *   kind: 'text' | 'boolean' | 'number' | 'choice',
 *   options?: readonly {value: string, label: string}[],
 *   min?: number, max?: number, step?: number,
 *   available?: (config: Configuration) => boolean}} Field
 * @typedef {{label: string, values: Configuration}} Preset
 */

/** @param {readonly Field[]} fields */
export function defaultsFor(fields) {
  return Object.fromEntries(fields.map(field => [field.key, field.default]));
}

/**
 * Normalize the same configuration consumed by preview and source adapters.
 * Inactive fields return to their defaults; a hidden value cannot leak into source.
 * @param {readonly Field[]} fields
 * @param {Configuration} values
 * @returns {Configuration}
 */
export function normalizeConfiguration(fields, values) {
  const result = defaultsFor(fields);
  for (const field of fields) {
    const value = values[field.key];
    if (field.kind === 'choice') {
      if (field.options?.some(option => option.value === value)) result[field.key] = value;
    } else if (field.kind === 'boolean' && typeof value === 'boolean') {
      result[field.key] = value;
    } else if (field.kind === 'text' && typeof value === 'string') {
      result[field.key] = value;
    } else if (field.kind === 'number' && typeof value === 'number' && Number.isFinite(value)) {
      result[field.key] = Math.min(field.max ?? Infinity, Math.max(field.min ?? -Infinity, value));
    }
  }
  // Only monotonic disabling is supported; dependencies must have valid defaults.
  for (let pass = 0; pass < fields.length; pass++) {
    let changed = false;
    for (const field of fields) {
      if (field.available && !field.available(result) && result[field.key] !== field.default) {
        result[field.key] = field.default;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return result;
}

/** @param {readonly Field[]} fields @param {Configuration} values @param {Configuration} patch */
export function changeConfiguration(fields, values, patch) {
  return normalizeConfiguration(fields, { ...values, ...patch });
}

/** Serialize authored strings as JSX expressions, not interpolated markup. */
export function jsxText(value) {
  return '{' + JSON.stringify(value) + '}';
}
