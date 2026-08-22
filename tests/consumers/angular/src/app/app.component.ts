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
import { VfTabs } from "./generated/vf-tabs.generated";
import { VfTextInput } from "./generated/vf-text-input.generated";
import { VyrnForgeFormControlDirective } from "./vyrnforge-form-control.directive";

type TabsElement = VyrnForgeElementForTagName<"vf-tabs">;
type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    VfButton,
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

  readonly owner = "Operations";
  readonly profileForm = new FormGroup({
    owner: new FormControl("Operations", { nonNullable: true }),
  });
  readonly tabs = [
    {
      id: "summary",
      label: "Summary",
      content: "Angular generated Tabs property binding",
    },
    {
      id: "events",
      label: "Events",
      content: "Angular generated valueChange output",
    },
  ] satisfies readonly VyrnForgeTabItem[];

  selectedTab = "summary";
  notifications = true;
  status = "Waiting";

  get ownerControl(): FormControl<string> {
    return this.profileForm.controls.owner;
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const tabsElement = this.tabsRef?.nativeElement;
      const ownerElement = this.ownerInputRef?.nativeElement;
      if (!tabsElement || !ownerElement) {
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
        throw new Error("Generated Angular Tabs did not assign the items property.");
      }
      if (tabsElement.hasAttribute("items")) {
        throw new Error("Generated Angular Tabs serialized the items property.");
      }
      if (tabsElement.value !== this.selectedTab) {
        throw new Error("Generated Angular Tabs did not preserve two-way value.");
      }
      if (ownerElement.value !== this.owner) {
        throw new Error("Angular did not assign the input value property.");
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
    this.selectedTab = value;
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-generated-tabs-value", value);
  }

  handleGeneratedTextInputValue(value: string): void {
    document
      .querySelector("[data-angular-consumer]")
      ?.setAttribute("data-generated-text-input-value", value);
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
