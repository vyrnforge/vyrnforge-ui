import { nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";

import { useVyrnForgeModel } from "./model";

class ModelEvent<T> extends Event {
  constructor(
    name: string,
    readonly value: T,
  ) {
    super(name);
  }
}

class ModelTarget<T> extends EventTarget {
  current!: T;
}

async function verifyModelRoundTrip<T>(name: string, initial: T, next: T) {
  const element = ref<ModelTarget<T> | null>(null);
  const modelValue = ref(initial);
  const emitted: T[] = [];

  useVyrnForgeModel({
    element,
    modelValue,
    eventName: name,
    write: (target, value) => {
      target.current = value;
    },
    read: (event: ModelEvent<T>) => event.value,
    emit: (value) => emitted.push(value),
  });

  const target = new ModelTarget<T>();
  element.value = target;
  await nextTick();
  expect(target.current).toEqual(initial);

  modelValue.value = next;
  await nextTick();
  expect(target.current).toEqual(next);

  target.dispatchEvent(new ModelEvent(name, next));
  expect(emitted).toEqual([]);

  target.dispatchEvent(new ModelEvent(name, initial));
  expect(emitted).toEqual([initial]);
}

describe("useVyrnForgeModel", () => {
  it("bridges value models without duplicate update loops", async () => {
    await verifyModelRoundTrip("vf-value-change", "first", "second");
  });

  it("bridges checked models without duplicate update loops", async () => {
    await verifyModelRoundTrip("vf-checked-change", false, true);
  });

  it("bridges open models without duplicate update loops", async () => {
    await verifyModelRoundTrip("vf-open-change", false, true);
  });
});
