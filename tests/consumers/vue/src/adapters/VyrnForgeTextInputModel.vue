<script setup lang="ts">
import { ref, toRef } from "vue";
import type {
  VyrnForgeElementForTagName,
  VyrnForgeValueChangeDetail,
} from "@vyrnforge/ui-elements";

import { useVyrnForgeModel } from "./useVyrnForgeModel";

type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

const props = defineProps<{
  modelValue: string;
  id?: string;
  name?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
const element = ref<TextInputElement | null>(null);

useVyrnForgeModel<
  TextInputElement,
  string,
  CustomEvent<VyrnForgeValueChangeDetail<string>>
>({
  element,
  modelValue: toRef(props, "modelValue"),
  eventName: "vf-value-change",
  write(target, value) {
    if (target.value !== value) target.value = value;
  },
  read(event) {
    return event.detail.value;
  },
  emit(value) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <vf-text-input
    ref="element"
    :id="props.id"
    :name="props.name"
    v-bind="$attrs"
  ></vf-text-input>
</template>
