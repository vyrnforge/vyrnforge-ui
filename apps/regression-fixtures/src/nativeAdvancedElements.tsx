import { useEffect, useRef } from "react";
import {
  VyrnForgeAppShellElement,
  VyrnForgeAutocompleteElement,
  VyrnForgeButtonElement,
  VyrnForgeConfirmDialogElement,
  VyrnForgeDialogElement,
  VyrnForgeDrawerElement,
  VyrnForgeMenuElement,
  VyrnForgeMultiSelectElement,
  VyrnForgePageHeaderElement,
  VyrnForgePageToolbarElement,
  VyrnForgePopoverElement,
  VyrnForgeToastViewportElement,
  VyrnForgeTooltipElement,
  VyrnForgeTransferListElement,
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

function createAction(
  document: Document,
  action: string,
  label: string,
  callback: () => void,
) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.vfFixtureAction = action;
  button.textContent = label;
  button.addEventListener("click", callback);
  return button;
}

export function NativeAdvancedElementsFixture() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerVyrnForgeElements();
    const mount = mountRef.current;
    if (!mount) return;
    const document = mount.ownerDocument;

    const root = document.createElement("div");
    root.className = "vf-fixture__stack";
    root.dataset.vfNativeAdvanced = "";

    const form = document.createElement("form");
    form.className = "vf-fixture__stack";
    form.dataset.vfFixtureRegion = "native-advanced-form";

    const autocomplete = document.createElement(
      "vf-autocomplete",
    ) as ElementInstance<typeof VyrnForgeAutocompleteElement>;
    autocomplete.name = "owner";
    autocomplete.placeholder = "Select owner";
    autocomplete.options = Object.freeze([
      { label: "Access team", value: "access" },
      { label: "Workflow team", value: "workflow" },
      { disabled: true, label: "Disabled team", value: "disabled" },
    ]);
    autocomplete.dataset.vfFixtureControl = "advanced-autocomplete";

    const multiSelect = document.createElement(
      "vf-multi-select",
    ) as ElementInstance<typeof VyrnForgeMultiSelectElement>;
    multiSelect.name = "roles";
    multiSelect.searchable = true;
    multiSelect.value = Object.freeze(["reader"]);
    multiSelect.options = Object.freeze([
      { label: "Reader", text: "Reader", value: "reader" },
      { label: "Editor", text: "Editor", value: "editor" },
      { disabled: true, label: "Owner", text: "Owner", value: "owner" },
    ]);
    multiSelect.dataset.vfFixtureControl = "advanced-multi-select";

    const transferList = document.createElement(
      "vf-transfer-list",
    ) as ElementInstance<typeof VyrnForgeTransferListElement>;
    transferList.name = "applications";
    transferList.value = Object.freeze(["portal"]);
    transferList.options = Object.freeze([
      { label: "Admin", value: "admin" },
      { label: "Portal", value: "portal" },
      { disabled: true, label: "Legacy", value: "legacy" },
    ]);
    transferList.dataset.vfFixtureControl = "advanced-transfer-list";

    const submission = createOutput(
      document,
      "native-advanced-submission",
      "No advanced submission yet",
    );
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.dataset.vfFixtureAction = "advanced-submit";
    submit.textContent = "Submit advanced form";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submission.textContent = [...new FormData(form).entries()]
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(", ");
    });
    form.append(autocomplete, multiSelect, transferList, submit, submission);

    const overlayState = createOutput(
      document,
      "native-advanced-overlays",
      "Overlays closed",
    );
    const dialog = document.createElement("vf-dialog") as ElementInstance<
      typeof VyrnForgeDialogElement
    >;
    dialog.title = "Native dialog";
    dialog.description = "Shared modal controller";
    dialog.textContent = "Dialog content";
    dialog.addEventListener("vf-open-change", () => {
      overlayState.textContent = `Dialog ${dialog.open ? "open" : "closed"}`;
    });

    const drawer = document.createElement("vf-drawer") as ElementInstance<
      typeof VyrnForgeDrawerElement
    >;
    drawer.title = "Native drawer";
    drawer.side = "right";
    drawer.textContent = "Drawer content";
    drawer.addEventListener("vf-open-change", () => {
      overlayState.textContent = `Drawer ${drawer.open ? "open" : "closed"}`;
    });

    const popover = document.createElement("vf-popover") as ElementInstance<
      typeof VyrnForgePopoverElement
    >;
    const popoverTrigger = document.createElement("button");
    popoverTrigger.slot = "trigger";
    popoverTrigger.textContent = "Popover trigger";
    popoverTrigger.dataset.vfFixtureAction = "advanced-popover-trigger";
    const popoverBody = document.createElement("div");
    popoverBody.textContent = "Popover content";
    popover.append(popoverTrigger, popoverBody);

    const menuOutput = createOutput(
      document,
      "native-advanced-menu",
      "Menu action: none",
    );
    const menu = document.createElement("vf-menu") as ElementInstance<
      typeof VyrnForgeMenuElement
    >;
    const menuTrigger = document.createElement("button");
    menuTrigger.slot = "trigger";
    menuTrigger.textContent = "Open menu";
    menuTrigger.dataset.vfFixtureAction = "advanced-menu-trigger";
    menu.items = Object.freeze([
      { id: "view", label: "View" },
      { disabled: true, id: "disabled", label: "Disabled" },
      { id: "edit", label: "Edit" },
    ]);
    menu.addEventListener("vf-action", (event) => {
      const detail = (event as CustomEvent<{ action: string }>).detail;
      menuOutput.textContent = `Menu action: ${detail.action}`;
    });
    menu.append(menuTrigger);

    const tooltip = document.createElement("vf-tooltip") as ElementInstance<
      typeof VyrnForgeTooltipElement
    >;
    tooltip.content = "Native tooltip";
    tooltip.delayMs = 0;
    const tooltipTrigger = document.createElement("button");
    tooltipTrigger.slot = "trigger";
    tooltipTrigger.textContent = "Tooltip trigger";
    tooltipTrigger.dataset.vfFixtureAction = "advanced-tooltip-trigger";
    tooltip.append(tooltipTrigger);

    const toastOutput = createOutput(
      document,
      "native-advanced-toast",
      "Toast: none",
    );
    const viewport = document.createElement(
      "vf-toast-viewport",
    ) as ElementInstance<typeof VyrnForgeToastViewportElement>;
    viewport.defaultDuration = 0;
    viewport.addEventListener("vf-toast-change", (event) => {
      const detail = event.detail;
      toastOutput.textContent =
        detail.action === "dismiss-all"
          ? "Toast: dismiss-all"
          : `Toast: ${detail.id}`;
    });

    const confirmOutput = createOutput(
      document,
      "native-advanced-confirm",
      "Confirmation: none",
    );
    const confirm = document.createElement(
      "vf-confirm-dialog",
    ) as ElementInstance<typeof VyrnForgeConfirmDialogElement>;
    confirm.title = "Delete account?";
    confirm.description = "This is a deterministic confirmation.";
    confirm.addEventListener("vf-confirm", () => {
      confirmOutput.textContent = "Confirmation: confirmed";
    });
    confirm.addEventListener("vf-cancel", () => {
      confirmOutput.textContent = "Confirmation: cancelled";
    });

    const overlayActions = document.createElement("div");
    overlayActions.className = "vf-fixture__actions";
    overlayActions.append(
      createAction(document, "advanced-open-dialog", "Open dialog", () =>
        dialog.show(),
      ),
      createAction(document, "advanced-open-drawer", "Open drawer", () =>
        drawer.show(),
      ),
      createAction(document, "advanced-add-toast", "Add toast", () => {
        viewport.add({
          description: "Saved through native feedback",
          id: "saved",
          title: "Saved",
          tone: "success",
        });
      }),
      createAction(document, "advanced-open-confirm", "Open confirm", () => {
        confirm.open = true;
      }),
    );

    const shell = document.createElement("vf-app-shell") as ElementInstance<
      typeof VyrnForgeAppShellElement
    >;
    shell.dataset.vfFixtureRegion = "native-advanced-composition";
    const header = document.createElement("header");
    header.slot = "header";
    header.textContent = "Enterprise header";
    const sidebar = document.createElement("nav");
    sidebar.slot = "sidebar";
    sidebar.textContent = "Enterprise navigation";
    const main = document.createElement("main");
    main.textContent = "Enterprise content";
    shell.append(header, sidebar, main);

    const pageHeader = document.createElement(
      "vf-page-header",
    ) as ElementInstance<typeof VyrnForgePageHeaderElement>;
    pageHeader.eyebrow = "IAM";
    pageHeader.title = "Accounts";
    pageHeader.description = "Manage enterprise identities";

    const pageHeaderActionOutput = createOutput(
      document,
      "native-advanced-page-header-action",
      "No reconnected page-header action yet",
    );
    const pageHeaderAction = document.createElement(
      "vf-button",
    ) as ElementInstance<typeof VyrnForgeButtonElement>;
    pageHeaderAction.slot = "actions";
    pageHeaderAction.action = "page-header-save";
    pageHeaderAction.textContent = "Save page header";
    pageHeaderAction.dataset.vfFixtureAction = "advanced-page-header-action";
    pageHeaderAction.addEventListener("vf-action", () => {
      pageHeaderActionOutput.textContent =
        "Reconnected page-header action received";
    });
    pageHeader.append(pageHeaderAction);

    const pageToolbar = document.createElement(
      "vf-page-toolbar",
    ) as ElementInstance<typeof VyrnForgePageToolbarElement>;
    pageToolbar.label = "Account actions";
    pageToolbar.density = "compact";
    const toolbarAction = document.createElement("button");
    toolbarAction.textContent = "Create account";
    pageToolbar.append(toolbarAction);

    root.append(
      form,
      overlayActions,
      dialog,
      drawer,
      popover,
      menu,
      menuOutput,
      tooltip,
      viewport,
      toastOutput,
      confirm,
      confirmOutput,
      overlayState,
      pageHeader,
      pageHeaderActionOutput,
      pageToolbar,
      shell,
    );
    mount.replaceChildren(root);

    return () => mount.replaceChildren();
  }, []);

  return <div ref={mountRef} />;
}
