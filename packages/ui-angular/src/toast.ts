import { Injectable, type OnDestroy } from "@angular/core";
import {
  createVyrnForgeToastService,
  type VyrnForgeToastService as BrowserToastService,
  type VyrnForgeToastServiceRecord,
  type VyrnForgeToastShortcutRecord,
} from "@vyrnforge/ui-elements";

export class VyrnForgeToastService implements OnDestroy {
  readonly #service: BrowserToastService = createVyrnForgeToastService();

  getSnapshot() {
    return this.#service.getSnapshot();
  }

  toast(record: VyrnForgeToastServiceRecord): string {
    return this.#service.toast(record);
  }

  success(record: VyrnForgeToastShortcutRecord): string {
    return this.#service.success(record);
  }

  error(record: VyrnForgeToastShortcutRecord): string {
    return this.#service.error(record);
  }

  warning(record: VyrnForgeToastShortcutRecord): string {
    return this.#service.warning(record);
  }

  info(record: VyrnForgeToastShortcutRecord): string {
    return this.#service.info(record);
  }

  update(id: string, record: Partial<VyrnForgeToastServiceRecord>): boolean {
    return this.#service.update(id, record);
  }

  dismiss(id: string): boolean {
    return this.#service.dismiss(id);
  }

  dismissAll(): boolean {
    return this.#service.dismissAll();
  }

  pause(id: string): boolean {
    return this.#service.pause(id);
  }

  resume(id: string): boolean {
    return this.#service.resume(id);
  }

  triggerAction(id: string): boolean {
    return this.#service.triggerAction(id);
  }

  ngOnDestroy(): void {
    this.#service.destroy();
  }
}

Injectable({ providedIn: "root" })(VyrnForgeToastService);
