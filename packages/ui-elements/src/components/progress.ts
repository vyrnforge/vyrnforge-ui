import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import { VyrnForgeDomElement } from "./dom";

export class VyrnForgeProgressElement extends VyrnForgeDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      max: { reflect: true, type: "number" },
      value: { reflect: true, type: "number" },
    });

  #track: HTMLDivElement | null = null;
  #valueBar: HTMLDivElement | null = null;

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
    const visual = this.ensureVisual();
    if (!visual) return;

    const max = this.max > 0 ? this.max : 1;
    const value =
      this.value === null ? null : Math.min(max, Math.max(0, this.value));

    this.applyManagedClasses(["vf-progress"]);
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(max));
    if (value === null) {
      this.removeAttribute("aria-valuenow");
      this.setAttribute("data-state", "indeterminate");
      visual.valueBar.style.removeProperty("--vf-progress-value");
    } else {
      this.setAttribute("aria-valuenow", String(value));
      this.setAttribute("data-state", "determinate");
      visual.valueBar.style.setProperty(
        "--vf-progress-value",
        `${(value / max) * 100}%`,
      );
    }
    this.setAttribute("data-vf-element", "");
  }

  private ensureVisual(): {
    track: HTMLDivElement;
    valueBar: HTMLDivElement;
  } | null {
    if (this.#track?.isConnected && this.#valueBar?.isConnected) {
      return { track: this.#track, valueBar: this.#valueBar };
    }
    const document = this.resolveDocument();
    if (!document) return null;
    const track = document.createElement("div");
    track.className = "vf-progress__bar";
    track.setAttribute("aria-hidden", "true");
    const valueBar = document.createElement("div");
    valueBar.className = "vf-progress__value";
    valueBar.setAttribute("aria-hidden", "true");
    track.append(valueBar);
    this.replaceChildren(track);
    this.#track = track;
    this.#valueBar = valueBar;
    return { track, valueBar };
  }
}
