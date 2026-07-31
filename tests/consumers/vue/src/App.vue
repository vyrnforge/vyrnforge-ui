<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import type {
  VyrnForgeActionDetail,
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
  VyrnForgeValueChangeDetail,
} from "@vyrnforge/ui-elements";

type TabsElement = VyrnForgeElementForTagName<"vf-tabs">;
type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

const consumerRoot = ref<HTMLElement | null>(null);
const tabsElement = ref<TabsElement | null>(null);
const ownerElement = ref<TextInputElement | null>(null);
const owner = ref("Operations");
const status = ref("Waiting");

const tabs = [
  {
    id: "summary",
    label: "Summary",
    content: "Vue 3 property binding",
  },
  {
    id: "events",
    label: "Events",
    content: "Canonical DOM event binding",
  },
] satisfies readonly VyrnForgeTabItem[];

function handleAction(event: Event): void {
  const detail = (event as CustomEvent<VyrnForgeActionDetail>).detail;
  status.value = `Action: ${detail.action ?? "vue-save"} (${detail.reason})`;
  consumerRoot.value?.setAttribute("data-consumer-action", "received");
}

function handleOwnerValueChange(event: Event): void {
  const detail = (event as CustomEvent<VyrnForgeValueChangeDetail<string>>)
    .detail;
  owner.value = detail.value;
  consumerRoot.value?.setAttribute("data-consumer-value", "received");
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

  const tabsNode = tabsElement.value;
  const ownerNode = ownerElement.value;
  if (!tabsNode || !ownerNode) {
    throw new Error("Vue did not attach the Custom Element template refs.");
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
    throw new Error("Vue did not assign the tabs items property.");
  }
  if (tabsNode.hasAttribute("items")) {
    throw new Error("Vue serialized the tabs items property.");
  }
  if (ownerNode.value !== owner.value) {
    throw new Error("Vue did not assign the text-input value property.");
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
      <vf-button
        id="vue-save"
        slot="actions"
        action="vue-save"
        variant="primary"
        @vf-action="handleAction"
      >
        Save from Vue
      </vf-button>
    </vf-page-header>

    <vf-tabs
      ref="tabsElement"
      aria-label="Vue consumer sections"
      :items.prop="tabs"
    ></vf-tabs>

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

    <output aria-live="polite" data-consumer-status>{{ status }}</output>
  </main>
</template>
