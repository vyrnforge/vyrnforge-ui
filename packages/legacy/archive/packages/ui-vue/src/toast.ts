import {
  createVyrnForgeToastService,
  type VyrnForgeToastService,
} from "@vyrnforge/ui-elements";
import { inject, type InjectionKey } from "vue";

export const vyrnForgeToastKey: InjectionKey<VyrnForgeToastService> = Symbol(
  "VyrnForgeToastService",
);

export function createVyrnForgeVueToastService(): VyrnForgeToastService {
  return createVyrnForgeToastService();
}

export function useVyrnForgeToast(): VyrnForgeToastService {
  const service = inject(vyrnForgeToastKey);
  if (!service) {
    throw new Error(
      "useVyrnForgeToast requires VyrnForgeVue to be installed on the current Vue application.",
    );
  }
  return service;
}
