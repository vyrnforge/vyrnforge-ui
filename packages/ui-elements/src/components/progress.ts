import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

export class VyrnForgeProgressElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      max: { reflect: true, type: "number" },
      value: { reflect: true, type: "number" },
    });

  #progress: HTMLProgressElement | null = null;

  get max(): number {
    return this.getPropertyValue("max", 1);
  }

  set max(value: number) {
    const normalized = Number(value);
    this.setPropertyValue(
      "max",
      Number.isFinite(normalized) && normalized > 0 ? normalized : 1,
    );
  }

  get value(): number | null {
    return this.getPropertyValue<number | null>("value", null);
  }

  set value(value: number | null) {
    if (value === null) {
      this.setPropertyValue("value", null);
      return;
    }
    const normalized = Number(value);
    this.setPropertyValue(
      "value",
      Number.isFinite(normalized) ? normalized : null,
    );
  }

  protected override update(): void {
    const progress = this.ensureProgress();
    if (!progress) return;

    const max = this.max > 0 ? this.max : 1;
    const value =
      this.value === null ? null : Math.min(max, Math.max(0, this.value));

    this.applyManagedClasses(["vf-progress"]);
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(max));
    if (value === null) {
      this.removeAttribute("aria-valuenow");
      progress.removeAttribute("value");
    } else {
      this.setAttribute("aria-valuenow", String(value));
      progress.value = value;
    }
    progress.max = max;
    this.setAttribute("data-vf-element", "");
  }

  private ensureProgress(): HTMLProgressElement | null {
    if (this.#progress?.isConnected) return this.#progress;
    const document = this.resolveDocument();
    if (!document) return null;
    const progress = document.createElement("progress");
    progress.className = "vf-progress__bar";
    progress.setAttribute("aria-hidden", "true");
    this.replaceChildren(progress);
    this.#progress = progress;
    return progress;
  }
}
