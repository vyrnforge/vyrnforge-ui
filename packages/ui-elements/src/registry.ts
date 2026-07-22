export type VyrnForgeElementConstructor = CustomElementConstructor;

export interface VyrnForgeElementRegistry {
  define(name: string, constructor: VyrnForgeElementConstructor): void;
  get(name: string): VyrnForgeElementConstructor | undefined;
}

export function getVyrnForgeElementRegistry():
  VyrnForgeElementRegistry | undefined {
  return globalThis.customElements;
}

export function defineVyrnForgeElement(
  tagName: `vf-${string}`,
  constructor: VyrnForgeElementConstructor,
  registry = getVyrnForgeElementRegistry(),
): boolean {
  if (!/^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tagName)) {
    throw new TypeError(`Invalid VyrnForge element tag: ${tagName}`);
  }
  if (!registry || registry.get(tagName)) return false;
  registry.define(tagName, constructor);
  return true;
}

export function registerVyrnForgeElements(
  _registry = getVyrnForgeElementRegistry(),
): readonly string[] {
  // S4 establishes the explicit registration contract. S6 adds public
  // non-grid element definitions to this list after shared behavior parity.
  return Object.freeze([] as string[]);
}
