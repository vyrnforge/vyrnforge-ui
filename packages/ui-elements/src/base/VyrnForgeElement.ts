const ServerSafeHTMLElement = (globalThis.HTMLElement ??
  class {}) as typeof HTMLElement;

export abstract class VyrnForgeElement extends ServerSafeHTMLElement {
  protected upgradeProperty(propertyName: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, propertyName)) return;

    const value = (this as unknown as Record<string, unknown>)[propertyName];
    delete (this as unknown as Record<string, unknown>)[propertyName];
    (this as unknown as Record<string, unknown>)[propertyName] = value;
  }
}
