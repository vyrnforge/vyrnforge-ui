import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

@Component({
  selector: "app-vyrnforge-contract",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./example.component.html",
})
export class VyrnForgeContractComponent {
  save(): void {
    // Application-owned workflow.
  }
}
