function freezeDefinition(definition) {
  return Object.freeze(definition);
}

export function tokenLiteral(type, value) {
  if (!type || typeof type !== 'string') throw new TypeError('Token literal type must be a non-empty string.');
  if (typeof value !== 'string') throw new TypeError('Token literal value must be a string.');
  return freezeDefinition({ type, value });
}

export function tokenReference(type, target, options = {}) {
  if (!type || typeof type !== 'string') throw new TypeError('Token reference type must be a non-empty string.');
  if (!target || typeof target !== 'string') throw new TypeError('Token reference target must be a non-empty string.');
  const emit = options.emit ?? 'resolved';
  if (emit !== 'resolved' && emit !== 'css-var') throw new TypeError(`Unsupported token reference emit mode: ${emit}`);
  return freezeDefinition({ type, reference: target, emit });
}

export function deprecatedTokenAlias(type, replacement, reviewTrigger) {
  if (!replacement?.startsWith('--vf-')) throw new TypeError('Deprecated public token replacement must be a --vf-* runtime token.');
  if (!reviewTrigger || typeof reviewTrigger !== 'string') throw new TypeError('Deprecated public token requires an accountable review/removal trigger.');
  return freezeDefinition({
    type,
    reference: `runtime.${replacement}`,
    emit: 'css-var',
    deprecated: Object.freeze({ replacement, reviewTrigger }),
  });
}

function readPath(root, path) {
  let current = root;
  for (const segment of path.split('.')) {
    if (current == null || !Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    current = current[segment];
  }
  return current;
}

function referenceType(path, typeHints) {
  if (typeHints[path]) return typeHints[path];
  const root = path.split('.')[0];
  return typeHints[root];
}

export function compileRuntimeTokenDefinitions(definitions, {
  references = {},
  referenceTypes = {},
} = {}) {
  const resolved = new Map();
  const active = [];

  function resolveRuntime(name) {
    if (resolved.has(name)) return resolved.get(name);
    const cycleIndex = active.indexOf(name);
    if (cycleIndex !== -1) {
      const chain = [...active.slice(cycleIndex), name].join(' -> ');
      throw new Error(`Token reference cycle: ${chain}`);
    }

    const definition = definitions[name];
    if (!definition) {
      const chain = [...active, name].join(' -> ');
      throw new Error(`Missing runtime token reference: ${chain}`);
    }

    active.push(name);
    let value;
    if (Object.prototype.hasOwnProperty.call(definition, 'value')) {
      value = definition.value;
    } else if (definition.reference?.startsWith('reference.')) {
      const path = definition.reference.slice('reference.'.length);
      const targetValue = readPath(references, path);
      if (targetValue === undefined) {
        throw new Error(`Missing token reference: ${[...active, definition.reference].join(' -> ')}`);
      }
      const targetType = referenceType(path, referenceTypes);
      if (!targetType) {
        throw new Error(`Missing token type metadata for reference.${path}`);
      }
      if (targetType !== definition.type) {
        throw new Error(`Token type mismatch: ${name} (${definition.type}) -> ${definition.reference} (${targetType})`);
      }
      value = targetValue;
    } else if (definition.reference?.startsWith('runtime.')) {
      const targetName = definition.reference.slice('runtime.'.length);
      const targetDefinition = definitions[targetName];
      if (!targetDefinition) {
        throw new Error(`Missing runtime token reference: ${[...active, targetName].join(' -> ')}`);
      }
      if (targetDefinition.type !== definition.type) {
        throw new Error(`Token type mismatch: ${name} (${definition.type}) -> ${targetName} (${targetDefinition.type})`);
      }
      value = resolveRuntime(targetName);
    } else {
      throw new Error(`Token ${name} must define either value or reference.`);
    }

    active.pop();
    resolved.set(name, value);
    return value;
  }

  const values = {};
  const cssValues = {};
  const deprecations = {};

  for (const [name, definition] of Object.entries(definitions)) {
    values[name] = resolveRuntime(name);
    if (definition.emit === 'css-var') {
      if (!definition.reference?.startsWith('runtime.')) {
        throw new Error(`Token ${name} can emit css-var only for a runtime token reference.`);
      }
      const targetName = definition.reference.slice('runtime.'.length);
      cssValues[name] = `var(${targetName})`;
    } else {
      cssValues[name] = values[name];
    }

    if (definition.deprecated) {
      const targetName = definition.reference?.slice('runtime.'.length);
      if (targetName !== definition.deprecated.replacement) {
        throw new Error(`Deprecated token ${name} replacement metadata does not match its forwarding target.`);
      }
      deprecations[name] = definition.deprecated;
    }
  }

  return Object.freeze({
    values: Object.freeze(values),
    cssValues: Object.freeze(cssValues),
    deprecations: Object.freeze(deprecations),
  });
}