<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

import VyrnForgeCheckboxModel from "./adapters/VyrnForgeCheckboxModel.vue";
import VfButton from "./generated/VfButton.generated";
import VfDialog, {
  type GeneratedDialogDismissDetail,
} from "./generated/VfDialog.generated";
import GeneratedVfTabs from "./generated/VfTabs.generated";
import GeneratedVfTextInput from "./generated/VfTextInput.generated";
import type {
  VyrnForgeActionDetail,
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
  VyrnForgeValueChangeDetail,
} from "@vyrnforge/ui-elements";

type DialogElement = VyrnForgeElementForTagName<"vf-dialog">;
type TabsElement = VyrnForgeElementForTagName<"vf-tabs">;
type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

const consumerRoot = ref<HTMLElement | null>(null);
const ownerElement = ref<TextInputElement | null>(null);
const activeTab = ref("summary");
const dialogOpen = ref(false);
const owner = ref("Operations");
const status = ref("Waiting");
const modelOwner = ref("Model Operations");
const modelNotifications = ref(true);

const tabs = [
  {
    id: "summary",
    label: "Summary",
    content: "Vue generated Tabs facade",
  },
  {
    id: "events",
    label: "Events",
    content: "Vue v-model and canonical DOM event mapping",
  },
] satisfies readonly VyrnForgeTabItem[];

function handleAction(event: Event): void {
  const detail = (event as CustomEvent<VyrnForgeActionDetail>).detail;
  status.value = `Action: ${detail.action ?? "vue-save"} (${detail.reason})`;
  consumerRoot.value?.setAttribute("data-consumer-action", "received");
}

function handleGeneratedButtonAction(detail: VyrnForgeActionDetail): void {
  if (detail.action !== "vue-save") {
    throw new Error("Generated Vue Button action mapping is invalid.");
  }
  consumerRoot.value?.setAttribute("data-generated-button-action", "received");
}

function handleGeneratedTabsValue(event: Event): void {
  const detail = (event as CustomEvent<VyrnForgeValueChangeDetail<string>>)
    .detail;
  consumerRoot.value?.setAttribute("data-generated-tabs-value", detail.value);
}

function handleOwnerValueChange(event: Event): void {
  const detail = (event as CustomEvent<VyrnForgeValueChangeDetail<string>>)
    .detail;
  owner.value = detail.value;
  consumerRoot.value?.setAttribute("data-consumer-value", "received");
}

function handleDialogOpenChange(open: boolean): void {
  consumerRoot.value?.setAttribute("data-generated-dialog-open", String(open));
}

function handleDialogDismiss(detail: GeneratedDialogDismissDetail): void {
  consumerRoot.value?.setAttribute("data-generated-dialog-dismiss", detail.reason);
}

function applyProgrammaticModel(): void {
  modelOwner.value = "Programmatic Vue";
  modelNotifications.value = true;
  consumerRoot.value?.setAttribute("data-vue-model-programmatic", "applied");
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  status.value = `Submitted owner: ${String(formData.get("owner"))}`;
  consumerRoot.value?.setAttribute("data-consumer-form", "submitted");
}

onMounted(async () => {
  await nextTick();

  const tabsNode = document.querySelector<TabsElement>(
    'vf-tabs[data-vf-generated-tabs="vue"]',
  );
  const dialogNode = document.querySelector<DialogElement>(
    'vf-dialog[data-vf-generated-dialog="vue"]',
  );
  const ownerNode = ownerElement.value;
  if (!tabsNode || !dialogNode || !ownerNode) {
    throw new Error("Vue did not attach the Custom Element refs.");
  }

  const assignedItems = tabsNode.items;
  const itemsMatch =
    assignedItems.length === tabs.length &&
    assignedItems.every((item, index) => {
      const expected = tabs[index];
      return (
        expected !== undefined &&
        item.id === expected.id &&
        item.label === expected.label &&
        item.content === expected.content
      );
    });

  if (!itemsMatch) {
    throw new Error("Generated Vue Tabs did not assign the items property.");
  }
  if (tabsNode.hasAttribute("items")) {
    throw new Error("Generated Vue Tabs serialized the items property.");
  }
  if (tabsNode.value !== activeTab.value) {
    throw new Error("Generated Vue Tabs did not retain v-model value.");
  }
  if (ownerNode.value !== owner.value) {
    throw new Error("Vue did not assign the text-input value property.");
  }
  if (dialogNode.open !== dialogOpen.value) {
    throw new Error("Generated Vue Dialog did not retain v-model:open state.");
  }

  consumerRoot.value?.setAttribute("data-consumer-property", "verified");
  consumerRoot.value?.setAttribute("data-consumer-ready", "true");
});
</script>

<template>
  <main ref="consumerRoot" class="vf-consumer-vue" data-vue-consumer>
    <vf-page-header
      eyebrow="GMF4 consumer evidence"
      title="Vue packed consumer"
      description="Vue 3 consumes the native VyrnForge package directly."
    >
      <span slot="status" data-vue-slot="status">Vue 3.5</span>
      <VfButton
        id="vue-save"
        slot="actions"
        action="vue-save"
        variant="primary"
        @vf-action="handleAction"
        @action="handleGeneratedButtonAction"
      >
        Save from Vue
      </VfButton>
    </vf-page-header>

    <GeneratedVfTabs
      v-model="activeTab"
      ariaLabel="Vue consumer sections"
      activation-mode="automatic"
      :items="tabs"
      @vf-value-change="handleGeneratedTabsValue"
    />

    <section class="vf-consumer-vue-section" aria-labelledby="value-title">
      <h2 id="value-title">Canonical value event</h2>
      <label for="vue-owner-preview">Owner</label>
      <vf-text-input
        id="vue-owner-preview"
        ref="ownerElement"
        name="ownerPreview"
        :value.prop="owner"
        @vf-value-change="handleOwnerValueChange"
      ></vf-text-input>
      <output data-vue-value>{{ owner }}</output>
    </section>

    <section class="vf-consumer-vue-section" aria-labelledby="model-title">
      <h2 id="model-title">Generated Vue v-model facade</h2>
      <label for="vue-model-owner">Model owner</label>
      <GeneratedVfTextInput
        id="vue-model-owner"
        v-model="modelOwner"
        name="modelOwner"
        label="Model owner"
      />
      <output data-vue-model-value>{{ modelOwner }}</output>

      <VyrnForgeCheckboxModel
        id="vue-model-notifications"
        v-model="modelNotifications"
        name="modelNotifications"
        label="Notifications"
      />
      <output data-vue-model-checked>{{ modelNotifications }}</output>

      <vf-button
        id="vue-model-programmatic"
        action="programmatic-model"
        variant="default"
        @vf-action="applyProgrammaticModel"
      >
        Apply model from Vue
      </vf-button>
    </section>

    <section class="vf-consumer-vue-section" aria-labelledby="native-title">
      <h2 id="native-title">Native ElementInternals form</h2>
      <form id="vue-form" class="vf-consumer-vue-form" @submit="handleSubmit">
        <label for="vue-form-owner">Form owner</label>
        <vf-text-input
          id="vue-form-owner"
          name="owner"
          required
          value="Operations"
        ></vf-text-input>
        <vf-button type="submit" variant="default"> Submit Vue form </vf-button>
      </form>
    </section>

    <VfDialog
      v-model:open="dialogOpen"
      title="Vue generated dialog"
      description="Generated Vue Dialog focus lifecycle evidence"
      @update:open="handleDialogOpenChange"
      @dismiss="handleDialogDismiss"
    >
      <template #trigger>
        <button type="button" data-dialog-trigger>Open Vue dialog</button>
      </template>
      <template #content>
        <div>
          <button type="button" data-dialog-first>First dialog action</button>
          <button type="button" data-dialog-last>Last dialog action</button>
        </div>
      </template>
    </VfDialog>

    <output aria-live="polite" data-consumer-status>{{ status }}</output>
  </main>
</template>
