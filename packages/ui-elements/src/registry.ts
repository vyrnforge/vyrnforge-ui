export type VyrnForgeElementTagName = `vf-${string}`;
export type VyrnForgeElementConstructor = CustomElementConstructor;

export interface VyrnForgeElementDefinition {
  readonly tagName: VyrnForgeElementTagName;
  readonly constructor: VyrnForgeElementConstructor;
}

export interface VyrnForgeElementRegistry {
  define(name: string, constructor: VyrnForgeElementConstructor): void;
  get(name: string): VyrnForgeElementConstructor | undefined;
}

export type VyrnForgeElementRegistration = (
  registry?: VyrnForgeElementRegistry,
) => boolean;

const TAG_PATTERN = /^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const vyrnForgeElementDefinitions: readonly VyrnForgeElementDefinition[] =
  Object.freeze([]);

export function getVyrnForgeElementRegistry():
  VyrnForgeElementRegistry | undefined {
  return globalThis.customElements;
}

export function assertVyrnForgeElementTagName(
  tagName: string,
): asserts tagName is VyrnForgeElementTagName {
  if (!TAG_PATTERN.test(tagName)) {
    throw new TypeError(`Invalid VyrnForge element tag: ${tagName}`);
  }
}

export function defineVyrnForgeElement(
  tagName: VyrnForgeElementTagName,
  constructor: VyrnForgeElementConstructor,
  registry = getVyrnForgeElementRegistry(),
): boolean {
  assertVyrnForgeElementTagName(tagName);
  if (!registry || registry.get(tagName)) return false;
  registry.define(tagName, constructor);
  return true;
}

export function registerVyrnForgeElement(
  definition: VyrnForgeElementDefinition,
  registry = getVyrnForgeElementRegistry(),
): boolean {
  return defineVyrnForgeElement(
    definition.tagName,
    definition.constructor,
    registry,
  );
}

export function createVyrnForgeElementRegistration(
  definition: VyrnForgeElementDefinition,
): VyrnForgeElementRegistration {
  assertVyrnForgeElementTagName(definition.tagName);
  return (registry = getVyrnForgeElementRegistry()) =>
    registerVyrnForgeElement(definition, registry);
}

export function registerVyrnForgeElementDefinitions(
  definitions: readonly VyrnForgeElementDefinition[],
  registry = getVyrnForgeElementRegistry(),
): readonly VyrnForgeElementTagName[] {
  if (!registry) return Object.freeze([]);

  const registered: VyrnForgeElementTagName[] = [];
  for (const definition of definitions) {
    if (registerVyrnForgeElement(definition, registry)) {
      registered.push(definition.tagName);
    }
  }
  return Object.freeze(registered);
}

export function registerVyrnForgeElements(
  registry = getVyrnForgeElementRegistry(),
): readonly VyrnForgeElementTagName[] {
  return registerVyrnForgeElementDefinitions(
    vyrnForgeElementDefinitions,
    registry,
  );
}
