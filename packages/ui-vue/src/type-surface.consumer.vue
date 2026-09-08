<script setup lang="ts">
import { ref } from "vue";
import {
  VfCheckbox,
  VfDialog,
  VfPopover,
  VfTextInput,
  VfToggleButton,
  type VfCheckboxRef,
  type VfDialogRef,
  type VfPopoverRef,
  type VfTextInputRef,
} from "./index";

const text = ref("typed");
const open = ref(false);
const pressed = ref(false);
const textRef = ref<VfTextInputRef | null>(null);
const dialogRef = ref<VfDialogRef | null>(null);
const checkboxRef = ref<VfCheckboxRef | null>(null);
const popoverRef = ref<VfPopoverRef | null>(null);

textRef.value?.focus();
textRef.value?.select();
textRef.value?.checkValidity();
textRef.value?.reportValidity();
textRef.value?.setCustomValidity("");
dialogRef.value?.show();
dialogRef.value?.close();
dialogRef.value?.focus();
checkboxRef.value?.focus();
checkboxRef.value?.checkValidity();
popoverRef.value?.show();
popoverRef.value?.toggle();
popoverRef.value?.close();
</script>

<template>
  <VfTextInput ref="textRef" v-model="text" label="Typed" />
  <VfCheckbox ref="checkboxRef" :model-value="false" label="Checked" />
  <VfPopover ref="popoverRef">Popover</VfPopover>
  <VfDialog ref="dialogRef" v-model:open="open">
    <template #header>Header</template>
    Typed dialog
  </VfDialog>
  <VfToggleButton v-model:pressed="pressed">Toggle</VfToggleButton>
</template>
