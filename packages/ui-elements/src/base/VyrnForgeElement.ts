import type {
  VyrnForgeCanonicalEventDetailMap,
  VyrnForgeEventMapName,
} from "../events";

const ServerSafeHTMLElement = (globalThis.HTMLElement ??
  class {}) as typeof HTMLElement;

export type VyrnForgeAttributeType = "boolean" | "number" | "string";

export interface VyrnForgePropertyDeclaration {
  attribute?: false | string;
  reflect?: boolean;
  type?: VyrnForgeAttributeType;
}

export type VyrnForgePropertyDeclarations = Readonly<
  Record<string, VyrnForgePropertyDeclaration>
>;

export type VyrnForgeChangedProperties = ReadonlyMap<string, unknown>;

export type VyrnForgeElementEventListener<
  TTarget extends EventTarget,
  TName extends VyrnForgeEventMapName<VyrnForgeCanonicalEventDetailMap>,
> = (
  this: TTarget,
  event: CustomEvent<VyrnForgeCanonicalEventDetailMap[TName]>,
) => void;

function propertyToAttribute(propertyName: string): string {
  return propertyName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function getDeclarations(
  constructor: typeof VyrnForgeElement,
): VyrnForgePropertyDeclarations {
  const constructors: Array<typeof VyrnForgeElement> = [];
  let current: typeof VyrnForgeElement | undefined = constructor;

  while (current && current !== VyrnForgeElement) {
    constructors.unshift(current);
    current = Object.getPrototypeOf(current) as
      typeof VyrnForgeElement | undefined;
  }

  return Object.freeze(
    constructors.reduce<Record<string, VyrnForgePropertyDeclaration>>(
      (declarations, item) => Object.assign(declarations, item.properties),
      { ...VyrnForgeElement.properties },
    ),
  );
}

function resolveAttributeName(
  propertyName: string,
  declaration: VyrnForgePropertyDeclaration,
): false | string {
  if (declaration.attribute === false) return false;
  return declaration.attribute ?? propertyToAttribute(propertyName);
}

function parseAttributeValue(
  value: string | null,
  type: VyrnForgeAttributeType,
): unknown {
  if (type === "boolean") return value !== null;
  if (value === null) return null;
  if (type === "number") {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
  return value;
}

function serializeAttributeValue(
  value: unknown,
  type: VyrnForgeAttributeType,
): string | null {
  if (type === "boolean") return value ? "" : null;
  if (value === null || value === undefined) return null;
  if (type === "number") {
    return typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : null;
  }
  return String(value);
}

/**
 * Dependency-minimal Light DOM base for VyrnForge Custom Elements.
 *
 * Subclasses expose reactive properties with accessors that call
 * `getPropertyValue` and `setPropertyValue`. DOM reads, rendering, focus, and
 * form behavior remain the responsibility of the concrete element adapter.
 */
export abstract class VyrnForgeElement extends ServerSafeHTMLElement {
  static readonly properties: VyrnForgePropertyDeclarations = Object.freeze({});

  static get observedAttributes(): string[] {
    return Object.entries(getDeclarations(this))
      .map(([propertyName, declaration]) =>
        resolveAttributeName(propertyName, declaration),
      )
      .filter((attributeName): attributeName is string =>
        Boolean(attributeName),
      );
  }

  readonly #propertyValues = new Map<string, unknown>();
  readonly #changedProperties = new Map<string, unknown>();
  #connected = false;
  #reflectingAttribute: string | null = null;
  #updateScheduled = false;
  #updateQueued = false;
  #updateComplete: Promise<void> = Promise.resolve();
  #resolveUpdateComplete: (() => void) | null = null;

  get updateComplete(): Promise<void> {
    return this.#updateComplete;
  }

  addEventListener<
    TName extends VyrnForgeEventMapName<VyrnForgeCanonicalEventDetailMap>,
  >(
    type: TName,
    listener: VyrnForgeElementEventListener<this, TName> | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<TKey extends keyof HTMLElementEventMap>(
    type: TKey,
    listener: (this: this, event: HTMLElementEventMap[TKey]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  override addEventListener(
    type: string,
    listener: unknown,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (listener === null) return;
    super.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  removeEventListener<
    TName extends VyrnForgeEventMapName<VyrnForgeCanonicalEventDetailMap>,
  >(
    type: TName,
    listener: VyrnForgeElementEventListener<this, TName> | null,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener<TKey extends keyof HTMLElementEventMap>(
    type: TKey,
    listener: (this: this, event: HTMLElementEventMap[TKey]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  override removeEventListener(
    type: string,
    listener: unknown,
    options?: boolean | EventListenerOptions,
  ): void {
    if (listener === null) return;
    super.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  connectedCallback(): void {
    if (this.#connected) return;
    this.#connected = true;

    for (const propertyName of Object.keys(
      getDeclarations(this.constructor as typeof VyrnForgeElement),
    )) {
      this.upgradeProperty(propertyName);
    }

    this.connected();
    if (this.#updateScheduled) this.scheduleUpdate();
    else this.requestUpdate();
  }

  disconnectedCallback(): void {
    if (!this.#connected) return;
    this.#connected = false;
    this.disconnected();
  }

  attributeChangedCallback(
    attributeName: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue === newValue || this.#reflectingAttribute === attributeName) {
      return;
    }

    const entry = Object.entries(
      getDeclarations(this.constructor as typeof VyrnForgeElement),
    ).find(
      ([propertyName, declaration]) =>
        resolveAttributeName(propertyName, declaration) === attributeName,
    );
    if (!entry) return;

    const [propertyName, declaration] = entry;
    this.setPropertyValue(
      propertyName,
      parseAttributeValue(newValue, declaration.type ?? "string"),
      false,
    );
  }

  protected connected(): void {}

  protected disconnected(): void {}

  protected getPropertyValue<TValue>(
    propertyName: string,
    fallback: TValue,
  ): TValue {
    return this.#propertyValues.has(propertyName)
      ? (this.#propertyValues.get(propertyName) as TValue)
      : fallback;
  }

  protected setPropertyValue<TValue>(
    propertyName: string,
    value: TValue,
    reflect = true,
  ): boolean {
    const oldValue = this.#propertyValues.get(propertyName);
    if (Object.is(oldValue, value)) return false;

    this.#propertyValues.set(propertyName, value);
    this.requestUpdate(propertyName, oldValue);

    const declaration = getDeclarations(
      this.constructor as typeof VyrnForgeElement,
    )[propertyName];
    if (reflect && declaration?.reflect) {
      this.reflectProperty(propertyName, value, declaration);
    }

    return true;
  }

  protected upgradeProperty(propertyName: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, propertyName)) return;

    const value = (this as unknown as Record<string, unknown>)[propertyName];
    delete (this as unknown as Record<string, unknown>)[propertyName];
    (this as unknown as Record<string, unknown>)[propertyName] = value;
  }

  protected requestUpdate(propertyName?: string, oldValue?: unknown): void {
    if (propertyName && !this.#changedProperties.has(propertyName)) {
      this.#changedProperties.set(propertyName, oldValue);
    }
    if (this.#updateScheduled) return;

    this.#updateScheduled = true;
    this.#updateComplete = new Promise<void>((resolve) => {
      this.#resolveUpdateComplete = resolve;
    });

    if (this.#connected) this.scheduleUpdate();
  }

  protected shouldUpdate(
    _changedProperties: VyrnForgeChangedProperties,
  ): boolean {
    return true;
  }

  protected update(_changedProperties: VyrnForgeChangedProperties): void {}

  protected updated(_changedProperties: VyrnForgeChangedProperties): void {}

  protected performUpdate(): void {
    if (!this.#updateScheduled || !this.#connected) return;

    const changedProperties = new Map(this.#changedProperties);
    const resolveUpdateComplete = this.#resolveUpdateComplete;
    this.#changedProperties.clear();
    this.#updateScheduled = false;
    this.#resolveUpdateComplete = null;

    if (this.shouldUpdate(changedProperties)) {
      this.update(changedProperties);
      this.updated(changedProperties);
    }

    resolveUpdateComplete?.();
  }

  private scheduleUpdate(): void {
    if (this.#updateQueued) return;
    this.#updateQueued = true;
    queueMicrotask(() => {
      this.#updateQueued = false;
      this.performUpdate();
    });
  }

  private reflectProperty(
    propertyName: string,
    value: unknown,
    declaration: VyrnForgePropertyDeclaration,
  ): void {
    const attributeName = resolveAttributeName(propertyName, declaration);
    if (attributeName === false) return;

    const serialized = serializeAttributeValue(
      value,
      declaration.type ?? "string",
    );
    this.#reflectingAttribute = attributeName;
    try {
      if (serialized === null) this.removeAttribute(attributeName);
      else this.setAttribute(attributeName, serialized);
    } finally {
      this.#reflectingAttribute = null;
    }
  }
}
