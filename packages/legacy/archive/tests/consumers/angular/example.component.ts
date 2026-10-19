import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import type { VyrnForgeTabItem } from "@vyrnforge/ui-elements";

@Component({
  selector: "app-vyrnforge-contract",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./example.component.html",
})
export class VyrnForgeContractComponent {
  readonly tabs = [
    { id: "summary", label: "Summary", content: "Angular property binding" },
  ] satisfies readonly VyrnForgeTabItem[];

  save(event: Event): void {
    const action = (event as CustomEvent<{ action?: string }>).detail.action;
    void action;
  }
}
