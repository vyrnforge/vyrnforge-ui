<script setup lang="ts">
import { ref, toRef } from "vue";
import type {
  VyrnForgeCheckedChangeDetail,
  VyrnForgeElementForTagName,
} from "@vyrnforge/ui-elements";

import { useVyrnForgeModel } from "./useVyrnForgeModel";

type CheckboxElement = VyrnForgeElementForTagName<"vf-checkbox">;

const props = defineProps<{
  modelValue: boolean;
  id?: string;
  label?: string;
  name?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
const element = ref<CheckboxElement | null>(null);

useVyrnForgeModel<
  CheckboxElement,
  boolean,
  CustomEvent<VyrnForgeCheckedChangeDetail>
>({
  element,
  modelValue: toRef(props, "modelValue"),
  eventName: "vf-checked-change",
  write(target, value) {
    target.indeterminate = false;
    if (target.checked !== value) target.checked = value;
  },
  read(event) {
    return event.detail.checked === true;
  },
  emit(value) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <vf-checkbox
    ref="element"
    :id="props.id"
    :label="props.label"
    :name="props.name"
    v-bind="$attrs"
  ></vf-checkbox>
</template>
