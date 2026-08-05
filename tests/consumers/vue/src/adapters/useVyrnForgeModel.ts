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
}

export function useVyrnForgeModel<
  TElement extends EventTarget,
  TValue,
  TEvent extends Event,
>(options: VyrnForgeModelAdapterOptions<TElement, TValue, TEvent>): void {
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
        options.emit(options.read(event as TEvent));
      };
      element.addEventListener(options.eventName, listener);
      onCleanup(() => element.removeEventListener(options.eventName, listener));
    },
    { flush: "post", immediate: true },
  );
}
