import { useEffect, useRef } from "react";
import {
  VyrnForgeIconElement,
  VyrnForgeInlineMessageElement,
  VyrnForgePopoverElement,
  VyrnForgeSkeletonElement,
  VyrnForgeToastElement,
  VyrnForgeToastViewportElement,
  VyrnForgeTopNavElement,
  registerVyrnForgeElements,
} from "@vyrnforge/ui-elements";

type ElementInstance<
  TConstructor extends abstract new (...args: never[]) => unknown,
> = InstanceType<TConstructor>;

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

function createOutput(document: Document, region: string, text: string) {
  const output = document.createElement("output");
  output.dataset.vfFixtureRegion = region;
  output.textContent = text;
  return output;
}

export function NativeParityElementsFixture() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerVyrnForgeElements();
    const mount = mountRef.current;
    if (!mount) return;
    const document = mount.ownerDocument;

    const root = document.createElement("div");
    root.className = "vf-fixture__stack";
    root.dataset.vfNativeParity = "";

    const icon = document.createElement("vf-icon") as ElementInstance<
      typeof VyrnForgeIconElement
    >;
    icon.name = "Search";
    icon.size = "lg";
    icon.decorative = false;
    icon.title = "Search icon";
    icon.dataset.vfFixtureRegion = "native-parity-icon";

    const message = document.createElement(
      "vf-inline-message",
    ) as ElementInstance<typeof VyrnForgeInlineMessageElement>;
    message.title = "Policy saved";
    message.variant = "success";
    message.append("The updated policy is active.");
    message.dataset.vfFixtureRegion = "native-parity-message";

    const skeleton = document.createElement("vf-skeleton") as ElementInstance<
      typeof VyrnForgeSkeletonElement
    >;
    skeleton.animated = false;
    skeleton.height = 20;
    skeleton.radius = 6;
    skeleton.width = 160;
    skeleton.dataset.vfFixtureRegion = "native-parity-skeleton";

    const topNav = document.createElement("vf-top-nav") as ElementInstance<
      typeof VyrnForgeTopNavElement
    >;
    topNav.dataset.vfFixtureRegion = "native-parity-top-nav";
    const brand = document.createElement("strong");
    brand.slot = "brand";
    brand.textContent = "VyrnForge IAM";
    const navigation = document.createElement("a");
    navigation.slot = "navigation";
    navigation.href = "#accounts";
    navigation.textContent = "Accounts";
    const action = document.createElement("button");
    action.slot = "actions";
    action.type = "button";
    action.textContent = "Create account";
    const user = document.createElement("span");
    user.slot = "user";
    user.textContent = "Admin";
    topNav.append(brand, navigation, action, user);

    const dropdownOutput = createOutput(
      document,
      "native-parity-dropdown",
      "Dropdown closed",
    );
    const dropdown = document.createElement("vf-popover") as ElementInstance<
      typeof VyrnForgePopoverElement
    >;
    dropdown.dataset.vfFixtureRegion = "native-parity-dropdown-popover";
    const dropdownTrigger = document.createElement("button");
    dropdownTrigger.slot = "trigger";
    dropdownTrigger.type = "button";
    dropdownTrigger.textContent = "Open dropdown";
    dropdownTrigger.dataset.vfFixtureAction = "native-parity-dropdown-trigger";
    const dropdownContent = document.createElement("div");
    dropdownContent.className = "vf-dropdown";
    dropdownContent.textContent = "Composed dropdown content";
    dropdown.append(dropdownTrigger, dropdownContent);
    dropdown.addEventListener("vf-open-change", (event) => {
      const detail = (event as CustomEvent<{ open: boolean }>).detail;
      dropdownOutput.textContent = detail.open
        ? "Dropdown open"
        : "Dropdown closed";
    });

    const toastActionOutput = createOutput(
      document,
      "native-parity-toast-action",
      "Toast action idle",
    );
    const toast = document.createElement("vf-toast") as ElementInstance<
      typeof VyrnForgeToastElement
    >;
    toast.toastId = "parity-toast";
    toast.title = "Sync delayed";
    toast.description = "Retry the synchronization.";
    toast.actionLabel = "Retry";
    toast.dismissible = false;
    toast.addEventListener("vf-action", () => {
      toastActionOutput.textContent = "Toast action: retry";
    });

    const serviceOutput = createOutput(
      document,
      "native-parity-toast-service",
      "Toast service idle",
    );
    const viewport = document.createElement(
      "vf-toast-viewport",
    ) as ElementInstance<typeof VyrnForgeToastViewportElement>;
    viewport.label = "Native parity notifications";
    viewport.defaultDuration = 0;
    viewport.dataset.vfFixtureRegion = "native-parity-toast-viewport";
    let serviceToastId = "";

    const serviceActions = document.createElement("div");
    serviceActions.className = "vf-fixture__actions";
    serviceActions.append(
      createAction(
        document,
        "native-parity-toast-add",
        "Add service toast",
        () => {
          serviceToastId = viewport.add({
            id: "service-toast",
            title: "Service toast",
            description: "Created through the native viewport API.",
            duration: null,
          });
          serviceOutput.textContent = `Toast service: added ${serviceToastId}`;
        },
      ),
      createAction(
        document,
        "native-parity-toast-update",
        "Update service toast",
        () => {
          if (!serviceToastId) return;
          viewport.updateToast(serviceToastId, {
            description: "Updated through the native viewport API.",
          });
          serviceOutput.textContent = `Toast service: updated ${serviceToastId}`;
        },
      ),
      createAction(
        document,
        "native-parity-toast-dismiss",
        "Dismiss service toast",
        () => {
          if (!serviceToastId) return;
          viewport.dismiss(serviceToastId);
          serviceOutput.textContent = `Toast service: dismissed ${serviceToastId}`;
        },
      ),
    );

    root.append(
      icon,
      message,
      skeleton,
      topNav,
      dropdown,
      dropdownOutput,
      toast,
      toastActionOutput,
      serviceActions,
      viewport,
      serviceOutput,
    );
    mount.replaceChildren(root);

    return () => mount.replaceChildren();
  }, []);

  return <div ref={mountRef} />;
}
