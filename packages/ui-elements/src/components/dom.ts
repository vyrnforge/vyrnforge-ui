import { VyrnForgeElement } from "../base/VyrnForgeElement";

export type VyrnForgeInteractionReason =
  "keyboard" | "pointer" | "programmatic";

export function interactionReasonFromEvent(
  event: Event,
): VyrnForgeInteractionReason {
  return event instanceof MouseEvent && event.detail > 0
    ? "pointer"
    : "keyboard";
}

export abstract class VyrnForgeDomElement extends VyrnForgeElement {
  readonly #managedClasses = new Set<string>();

  protected applyManagedClasses(
    classes: readonly (false | null | string | undefined)[],
  ): void {
    if (!("classList" in this)) return;
    for (const className of this.#managedClasses)
      this.classList.remove(className);
    this.#managedClasses.clear();

    for (const className of classes) {
      if (!className) continue;
      this.classList.add(className);
      this.#managedClasses.add(className);
    }
  }

  protected setOptionalAttribute(
    name: string,
    value: null | string | undefined,
  ): void {
    if (value === null || value === undefined || value === "") {
      this.removeAttribute(name);
    } else {
      this.setAttribute(name, value);
    }
  }

  protected setBooleanAttribute(name: string, value: boolean): void {
    if (value) this.setAttribute(name, "");
    else this.removeAttribute(name);
  }

  protected resolveDocument(): Document | null {
    return this.ownerDocument ?? globalThis.document ?? null;
  }

  protected dispatchTypedEvent<TDetail>(
    name: `vf-${string}`,
    detail: TDetail,
    options?: { cancelable?: boolean },
  ): boolean {
    if (typeof this.dispatchEvent !== "function") return true;
    return this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        cancelable: options?.cancelable ?? false,
        detail,
      }),
    );
  }
}
