import { useEffect, useRef } from "react";
import {
  VyrnForgeBreadcrumbsElement,
  VyrnForgeButtonElement,
  VyrnForgeCheckboxElement,
  VyrnForgeFieldElement,
  VyrnForgeHeadingElement,
  VyrnForgeRatingElement,
  VyrnForgeSegmentedControlElement,
  VyrnForgeSelectElement,
  VyrnForgeSideNavElement,
  VyrnForgeSliderElement,
  VyrnForgeTabsElement,
  VyrnForgeTextInputElement,
  registerVyrnForgeElements,
} from "@vyrnforge/ui-elements";

type ElementInstance<
  TConstructor extends abstract new (...args: never[]) => unknown,
> = InstanceType<TConstructor>;

function createOutput(document: Document, region: string, text: string) {
  const output = document.createElement("output");
  output.dataset.vfFixtureRegion = region;
  output.textContent = text;
  return output;
}

export function NativeCoreElementsFixture() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerVyrnForgeElements();
    const mount = mountRef.current;
    if (!mount) return;
    const document = mount.ownerDocument;

    const root = document.createElement("div");
    root.className = "vf-fixture__stack";
    root.dataset.vfNativeCore = "";

    const heading = document.createElement("vf-heading") as ElementInstance<
      typeof VyrnForgeHeadingElement
    >;
    heading.level = 2;
    heading.size = "lg";
    heading.textContent = "Native core element gallery";
    heading.dataset.vfFixtureRegion = "native-core-heading";

    const card = document.createElement("vf-card");
    card.setAttribute("variant", "outlined");
    card.textContent = "Shared tokens and Light DOM styling";

    const actionOutput = createOutput(
      document,
      "native-core-action",
      "No native action yet",
    );
    const action = document.createElement("vf-button") as ElementInstance<
      typeof VyrnForgeButtonElement
    >;
    action.action = "create-case";
    action.variant = "primary";
    action.textContent = "Create native case";
    action.dataset.vfFixtureAction = "native-core-action";
    action.addEventListener("vf-action", () => {
      actionOutput.textContent = "Native action: create-case";
    });

    const form = document.createElement("form");
    form.className = "vf-fixture__stack";
    form.dataset.vfFixtureRegion = "native-core-form";

    const field = document.createElement("vf-field") as ElementInstance<
      typeof VyrnForgeFieldElement
    >;
    field.label = "Account name";
    field.description = "Required native text input";
    field.required = true;

    const textInput = document.createElement(
      "vf-text-input",
    ) as ElementInstance<typeof VyrnForgeTextInputElement>;
    textInput.name = "account";
    textInput.required = true;
    textInput.value = "initial";
    textInput.placeholder = "Account name";
    textInput.dataset.vfFixtureControl = "native-text-input";
    field.append(textInput);

    const checkbox = document.createElement("vf-checkbox") as ElementInstance<
      typeof VyrnForgeCheckboxElement
    >;
    checkbox.name = "subscribed";
    checkbox.value = "yes";
    checkbox.label = "Subscribe to updates";
    checkbox.dataset.vfFixtureControl = "native-checkbox";

    const select = document.createElement("vf-select") as ElementInstance<
      typeof VyrnForgeSelectElement
    >;
    select.name = "region";
    select.value = "west";
    select.options = Object.freeze([
      { label: "West", value: "west" },
      { label: "Central", value: "central" },
      { label: "East", value: "east" },
    ]);
    select.dataset.vfFixtureControl = "native-select";

    const slider = document.createElement("vf-slider") as ElementInstance<
      typeof VyrnForgeSliderElement
    >;
    slider.name = "risk";
    slider.label = "Risk";
    slider.min = 0;
    slider.max = 5;
    slider.step = 1;
    slider.value = 2;
    slider.dataset.vfFixtureControl = "native-slider";

    const rating = document.createElement("vf-rating") as ElementInstance<
      typeof VyrnForgeRatingElement
    >;
    rating.name = "rating";
    rating.label = "Experience rating";
    rating.value = 3;
    rating.dataset.vfFixtureControl = "native-rating";

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Submit native form";
    submit.dataset.vfFixtureAction = "native-core-submit";
    const formOutput = createOutput(
      document,
      "native-core-submission",
      "No native submission yet",
    );
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const entries = [...new FormData(form).entries()]
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(", ");
      formOutput.textContent = entries || "No native form value";
    });
    form.append(field, checkbox, select, slider, rating, submit, formOutput);

    const segmentedOutput = createOutput(
      document,
      "native-core-segmented",
      "Segment: summary",
    );
    const segmented = document.createElement(
      "vf-segmented-control",
    ) as ElementInstance<typeof VyrnForgeSegmentedControlElement>;
    segmented.label = "View";
    segmented.value = "summary";
    segmented.options = Object.freeze([
      { label: "Summary", value: "summary" },
      { label: "Activity", value: "activity" },
      { disabled: true, label: "Audit", value: "audit" },
    ]);
    segmented.dataset.vfFixtureControl = "native-segmented";
    segmented.addEventListener("vf-value-change", (event) => {
      const detail = (event as CustomEvent<{ value: string }>).detail;
      segmentedOutput.textContent = `Segment: ${detail.value}`;
    });

    const tabsOutput = createOutput(
      document,
      "native-core-tabs",
      "Tab: summary",
    );
    const tabs = document.createElement("vf-tabs") as ElementInstance<
      typeof VyrnForgeTabsElement
    >;
    tabs.value = "summary";
    tabs.items = Object.freeze([
      { content: "Summary panel", id: "summary", label: "Summary" },
      { content: "Activity panel", id: "activity", label: "Activity" },
      { content: "Audit panel", disabled: true, id: "audit", label: "Audit" },
    ]);
    tabs.dataset.vfFixtureControl = "native-tabs";
    tabs.addEventListener("vf-value-change", (event) => {
      const detail = (event as CustomEvent<{ value: string }>).detail;
      tabsOutput.textContent = `Tab: ${detail.value}`;
    });

    const breadcrumbOutput = createOutput(
      document,
      "native-core-breadcrumb",
      "Breadcrumb: none",
    );
    const breadcrumbs = document.createElement(
      "vf-breadcrumbs",
    ) as ElementInstance<typeof VyrnForgeBreadcrumbsElement>;
    breadcrumbs.items = Object.freeze([
      { id: "home", label: "Home" },
      { id: "cases", label: "Cases" },
      { current: true, id: "detail", label: "Case detail" },
    ]);
    breadcrumbs.addEventListener("vf-action", (event) => {
      const detail = (event as CustomEvent<{ value?: string }>).detail;
      breadcrumbOutput.textContent = `Breadcrumb: ${detail.value ?? "none"}`;
    });

    const navOutput = createOutput(
      document,
      "native-core-navigation",
      "Navigation: overview",
    );
    const sideNav = document.createElement("vf-side-nav") as ElementInstance<
      typeof VyrnForgeSideNavElement
    >;
    sideNav.activeId = "overview";
    sideNav.items = Object.freeze([
      { id: "overview", label: "Overview" },
      { id: "members", label: "Members" },
      { disabled: true, id: "disabled", label: "Disabled" },
    ]);
    sideNav.dataset.vfFixtureControl = "native-side-nav";
    sideNav.addEventListener("vf-value-change", (event) => {
      const detail = (event as CustomEvent<{ value: string }>).detail;
      navOutput.textContent = `Navigation: ${detail.value}`;
    });

    root.append(
      heading,
      card,
      action,
      actionOutput,
      form,
      segmented,
      segmentedOutput,
      tabs,
      tabsOutput,
      breadcrumbs,
      breadcrumbOutput,
      sideNav,
      navOutput,
    );
    mount.replaceChildren(root);

    return () => mount.replaceChildren();
  }, []);

  return <div ref={mountRef} />;
}
