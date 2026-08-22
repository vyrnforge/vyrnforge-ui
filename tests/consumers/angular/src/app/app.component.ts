import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import type {
  VyrnForgeActionDetail,
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
} from "@vyrnforge/ui-elements";

import { VfButton } from "./generated/vf-button.generated";
import {
  VfDialog,
  type GeneratedDialogDismissDetail,
} from "./generated/vf-dialog.generated";
import { VfTabs } from "./generated/vf-tabs.generated";
import { VfTextInput } from "./generated/vf-text-input.generated";
import { VyrnForgeFormControlDirective } from "./vyrnforge-form-control.directive";

type DialogElement = VyrnForgeElementForTagName<"vf-dialog">;
type TabsElement = VyrnForgeElementForTagName<"vf-tabs">;
type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    VfButton,
    VfDialog,
    VfTabs,
    VfTextInput,
    VyrnForgeFormControlDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./app.component.html",
})
export class AppComponent implements AfterViewInit {
  @ViewChild("tabsElement", { read: ElementRef })
  private tabsRef?: ElementRef<TabsElement>;

  @ViewChild("ownerInput", { read: ElementRef })
  private ownerInputRef?: ElementRef<TextInputElement>;

  @ViewChild("dialogElement", { read: ElementRef })
  private dialogRef?: ElementRef<DialogElement>;

  readonly owner = "Operations";
  readonly profileForm = new FormGroup({
    owner: new FormControl("Operations", { nonNullable: true }),
  });
  readonly tabs = [
    {
      id: "summary",
      label: "Summary",
      content: "Angular generated Tabs facade",
    },
    {
      id: "events",
      label: "Events",
      content: "Angular value/valueChange mapping",
    },
  ] satisfies readonly VyrnForgeTabItem[];

  activeTab = "summary";
  dialogOpen = false;
  notifications = true;
  status = "Waiting";

  get ownerControl(): FormControl<string> {
    return this.profileForm.controls.owner;
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const tabsElement = this.tabsRef?.nativeElement;
      const ownerElement = this.ownerInputRef?.nativeElement;
      const dialogElement = this.dialogRef?.nativeElement;
      if (!tabsElement || !ownerElement || !dialogElement) {
        throw new Error("Angular did not attach the Custom Element refs.");
      }

      const assignedItems = tabsElement.items;
      const itemsMatch =
        assignedItems.length === this.tabs.length &&
        assignedItems.every((item, index) => {
          const expected = this.tabs[index];
          return (
            expected !== undefined &&
            item.id === expected.id &&
            item.label === expected.label &&
            item.content === expected.content
          );
        });

      if (!itemsMatch) {
        throw new Error(
          "Generated Angular Tabs did not assign the items property.",
        );
      }
      if (tabsElement.hasAttribute("items")) {
        throw new Error(
          "Generated Angular Tabs serialized the items property.",
        );
      }
      if (tabsElement.value !== this.activeTab) {
        throw new Error("Generated Angular Tabs did not retain bound value.");
      }
      if (ownerElement.value !== this.owner) {
        throw new Error("Angular did not assign the input value property.");
      }
      if (dialogElement.open !== this.dialogOpen) {
        throw new Error(
          "Generated Angular Dialog did not retain bound open state.",
        );
      }

      const root = document.querySelector<HTMLElement>(
        "[data-angular-consumer]",
      );
      root?.setAttribute("data-consumer-property", "verified");
      root?.setAttribute("data-consumer-ready", "true");
    });
  }

  handleAction(event: Event): void {
    const detail = (event as CustomEvent<VyrnForgeActionDetail>).detail;
    this.status = `Action: ${detail.action ?? "angular-save"} (${detail.reason})`;
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-consumer-action", "received");
  }

  handleGeneratedButtonAction(detail: VyrnForgeActionDetail): void {
    if (detail.action !== "angular-save") {
      throw new Error("Generated Angular Button action mapping is invalid.");
    }
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-generated-button-action", "received");
  }

  handleGeneratedTabsValue(value: string): void {
    this.activeTab = value;
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-generated-tabs-value", value);
  }

  handleGeneratedTextInputValue(value: string): void {
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-generated-text-input-value", value);
  }

  handleDialogOpenChange(open: boolean): void {
    this.dialogOpen = open;
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-generated-dialog-open", String(open));
  }

  handleDialogDismiss(detail: GeneratedDialogDismissDetail): void {
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-generated-dialog-dismiss", detail.reason);
  }

  disableOwner(): void {
    this.ownerControl.disable();
  }

  enableOwner(): void {
    this.ownerControl.enable();
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    this.status = `Submitted owner: ${String(formData.get("owner"))}`;
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-consumer-form", "submitted");
  }
}
