<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

import {
  VfButton as VyrnForgeButton,
  VfCheckbox as VyrnForgeCheckbox,
  VfDescriptionList as VyrnForgeDescriptionList,
  VfDialog as VyrnForgeDialog,
  VfProgress as VyrnForgeProgress,
  VfPropertyTable as VyrnForgePropertyTable,
  VfTabs as VyrnForgeTabs,
  VfTimeline as VyrnForgeTimeline,
  VfTextInput as VyrnForgeTextInput,
  type GeneratedDialogDismissDetail,
} from "@vyrnforge/ui-vue";
import type {
  VyrnForgeActionDetail,
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
  VyrnForgeValueChangeDetail,
} from "@vyrnforge/ui-elements";

type DialogElement = VyrnForgeElementForTagName<"vf-dialog">;
type ProgressElement = VyrnForgeElementForTagName<"vf-progress">;
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
  consumerRoot.value?.setAttribute(
    "data-generated-dialog-dismiss",
    detail.reason,
  );
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

  const determinateProgress = document.querySelector<ProgressElement>(
    "#vue-progress-determinate",
  );
  const indeterminateProgress = document.querySelector<ProgressElement>(
    "#vue-progress-indeterminate",
  );
  if (!determinateProgress || !indeterminateProgress) {
    throw new Error("Vue did not render the generated Progress facades.");
  }
  if (
    determinateProgress.max !== 100 ||
    determinateProgress.value !== 40 ||
    determinateProgress.getAttribute("role") !== "progressbar" ||
    determinateProgress.getAttribute("aria-valuemax") !== "100" ||
    determinateProgress.getAttribute("aria-valuenow") !== "40"
  ) {
    throw new Error(
      "Generated Vue Progress did not preserve determinate semantics.",
    );
  }
  if (
    indeterminateProgress.max !== 100 ||
    indeterminateProgress.value !== null ||
    indeterminateProgress.hasAttribute("aria-valuenow")
  ) {
    throw new Error(
      "Generated Vue Progress did not preserve indeterminate semantics.",
    );
  }

  const propertyTable = document.querySelector(
    "vf-property-table#vue-property-table",
  );
  if (
    !propertyTable?.querySelector("table > caption") ||
    !propertyTable.querySelector('table > thead th[scope="col"]') ||
    !propertyTable.querySelector('table > tbody th[scope="row"]') ||
    !propertyTable.querySelector("table > tbody td")
  ) {
    throw new Error(
      "Vue PropertyTable did not preserve native table semantics.",
    );
  }

  const timeline = document.querySelector("vf-timeline#vue-timeline");
  const timelineItems = timeline?.querySelectorAll(
    ":scope > ol.vf-timeline__list > li.vf-timeline__item",
  );
  if (
    timelineItems?.length !== 2 ||
    !timelineItems[0]?.querySelector(
      'time[datetime="2026-09-24T08:00:00Z"]',
    ) ||
    !timelineItems[1]?.querySelector(
      'time[datetime="2026-09-24T09:00:00Z"]',
    )
  ) {
    throw new Error(
      "Vue Timeline did not preserve ordered list/time semantics.",
    );
  }

  const descriptionList = document.querySelector(
    "vf-description-list#vue-description-list",
  );
  if (
    !descriptionList?.querySelector(".vf-description-list__list > dt") ||
    !descriptionList.querySelector(".vf-description-list__list > dd")
  ) {
    throw new Error(
      "Vue DescriptionList did not preserve native term/description semantics.",
    );
  }

  consumerRoot.value?.setAttribute("data-progress", "verified");
  consumerRoot.value?.setAttribute("data-property-table", "verified");
  consumerRoot.value?.setAttribute("data-timeline", "verified");
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
      <span slot="actions" data-vue-slot="actions">
        <VyrnForgeButton
          id="vue-save"
          action="vue-save"
          variant="primary"
          @vf-action="handleAction"
          @action="handleGeneratedButtonAction"
        >
          Save from Vue
        </VyrnForgeButton>
      </span>
    </vf-page-header>

    <VyrnForgeTabs
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
        :value="owner"
        @vf-value-change="handleOwnerValueChange"
      ></vf-text-input>
      <output data-vue-value>{{ owner }}</output>
    </section>

    <section class="vf-consumer-vue-section" aria-labelledby="model-title">
      <h2 id="model-title">Generated Vue v-model facade</h2>
      <label for="vue-model-owner">Model owner</label>
      <VyrnForgeTextInput
        id="vue-model-owner"
        v-model="modelOwner"
        name="modelOwner"
        label="Model owner"
      />
      <output data-vue-model-value>{{ modelOwner }}</output>

      <VyrnForgeCheckbox
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

    <section class="vf-consumer-vue-section" aria-labelledby="progress-title">
      <h2 id="progress-title">Generated Vue Progress</h2>
      <VyrnForgeProgress
        id="vue-progress-determinate"
        aria-label="Vue upload progress"
        :max="100"
        :value="40"
      />
      <VyrnForgeProgress
        id="vue-progress-indeterminate"
        aria-label="Vue preparing export"
        :max="100"
      />
    </section>

    <!-- prettier-ignore -->
    <section
      class="vf-consumer-vue-section"
      aria-labelledby="property-table-title"
    >
      <h2 id="property-table-title">Generated Vue PropertyTable</h2>
      <VyrnForgePropertyTable id="vue-property-table">
        <table>
          <caption>Vue service properties</caption>
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Owner</th>
              <td>Operations</td>
            </tr>
          </tbody>
        </table>
      </VyrnForgePropertyTable>
    </section>

    <!-- prettier-ignore -->
    <section
      class="vf-consumer-vue-section"
      aria-labelledby="timeline-title"
    >
      <h2 id="timeline-title">Generated Vue Timeline</h2>
      <VyrnForgeTimeline id="vue-timeline">
        <li>
          <time datetime="2026-09-24T08:00:00Z">08:00 UTC</time>
          Created
        </li>
        <li>
          <time datetime="2026-09-24T09:00:00Z">09:00 UTC</time>
          Reviewed
        </li>
      </VyrnForgeTimeline>
    </section>

    <section
      class="vf-consumer-vue-section"
      aria-labelledby="description-list-title"
    >
      <h2 id="description-list-title">Generated Vue DescriptionList</h2>
      <VyrnForgeDescriptionList id="vue-description-list">
        <dt>Status</dt>
        <dd>Active</dd>
        <dt>Owner</dt>
        <dd>Operations</dd>
      </VyrnForgeDescriptionList>
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

    <VyrnForgeDialog
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
    </VyrnForgeDialog>

    <output aria-live="polite" data-consumer-status>{{ status }}</output>
  </main>
</template>
