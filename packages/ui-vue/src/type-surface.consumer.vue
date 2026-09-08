<script setup lang="ts">
import { ref } from "vue";
import {
  VfDialog,
  VfTextInput,
  VfToggleButton,
  type VfDialogRef,
  type VfTextInputRef,
} from "./index";

const text = ref("typed");
const open = ref(false);
const pressed = ref(false);
const textRef = ref<VfTextInputRef | null>(null);
const dialogRef = ref<VfDialogRef | null>(null);

textRef.value?.element?.focus();
textRef.value?.element?.checkValidity();
dialogRef.value?.element?.show();
dialogRef.value?.element?.close();
</script>

<template>
  <VfTextInput ref="textRef" v-model="text" label="Typed" />
  <VfDialog ref="dialogRef" v-model:open="open">
    <template #header>Header</template>
    Typed dialog
  </VfDialog>
  <VfToggleButton v-model:pressed="pressed">Toggle</VfToggleButton>
</template>
