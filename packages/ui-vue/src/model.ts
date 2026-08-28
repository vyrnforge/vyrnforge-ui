import { watch, type Ref } from "vue";

export interface VyrnForgeModelAdapterOptions<
  TElement extends EventTarget,
  TValue,
  TEvent extends Event,
> {
  readonly element: Ref<TElement | null>;
  readonly modelValue: Readonly<Ref<TValue>>;
  readonly eventName: string;
  readonly write: (element: TElement, value: TValue) => void;
  readonly read: (event: TEvent) => TValue;
  readonly emit: (value: TValue) => void;
  readonly equals?: (left: TValue, right: TValue) => boolean;
}

/**
 * Bridges one canonical element property/change-event pair to an idiomatic Vue
 * model without owning rendering or component state.
 */
export function useVyrnForgeModel<
  TElement extends EventTarget,
  TValue,
  TEvent extends Event,
>(options: VyrnForgeModelAdapterOptions<TElement, TValue, TEvent>): void {
  const equals = options.equals ?? Object.is;

  watch(
    options.modelValue,
    (value) => {
      const element = options.element.value;
      if (element) options.write(element, value);
    },
    { flush: "post", immediate: true },
  );

  watch(
    options.element,
    (element, _previous, onCleanup) => {
      if (!element) return;

      options.write(element, options.modelValue.value);
      const listener = (event: Event) => {
        const value = options.read(event as TEvent);
        if (!equals(value, options.modelValue.value)) options.emit(value);
      };
      element.addEventListener(options.eventName, listener);
      onCleanup(() => element.removeEventListener(options.eventName, listener));
    },
    { flush: "post", immediate: true },
  );
}
