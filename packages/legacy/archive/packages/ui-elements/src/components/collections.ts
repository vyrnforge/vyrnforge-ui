import {
  createAutocompleteController,
  createMultiSelectController,
  createTransferListController,
  type AutocompleteController,
  type AutocompleteItem,
  type MultiSelectController,
  type MultiSelectItem,
  type TransferListController,
  type TransferListItem,
  type TransferListPanel,
} from "@vyrnforge/ui-behaviors";
import type { VyrnForgePropertyDeclarations } from "../base/VyrnForgeElement";
import {
  VyrnForgeFormAssociatedElement,
  type VyrnForgeFormStateRestoreMode,
} from "../base/VyrnForgeFormAssociatedElement";

let collectionSequence = 0;

export interface VyrnForgeAutocompleteOption extends AutocompleteItem {
  readonly description?: string;
}

export interface VyrnForgeMultiSelectOption extends MultiSelectItem {
  readonly label: string;
  readonly description?: string;
}

export interface VyrnForgeTransferListOption extends TransferListItem {
  readonly description?: string;
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values.map(String))]);
}

abstract class VyrnForgeFormDomElement extends VyrnForgeFormAssociatedElement<string> {
  readonly #managedClasses = new Set<string>();

  protected applyManagedClasses(
    classes: readonly (false | null | string | undefined)[],
  ): void {
    for (const className of this.#managedClasses)
      this.classList.remove(className);
    this.#managedClasses.clear();
    for (const className of classes) {
      if (!className) continue;
      this.classList.add(className);
      this.#managedClasses.add(className);
    }
  }

  protected resolveDocument(): Document | null {
    return this.ownerDocument ?? globalThis.document ?? null;
  }

  protected dispatchTypedEvent<TDetail>(
    name: `vf-${string}`,
    detail: TDetail,
    options?: { cancelable?: boolean },
  ): boolean {
    return this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        cancelable: options?.cancelable ?? false,
        detail,
      }),
    );
  }
}

export class VyrnForgeAutocompleteElement extends VyrnForgeFormDomElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      autoHighlight: {
        attribute: "auto-highlight",
        reflect: true,
        type: "boolean",
      },
      clearable: { reflect: true, type: "boolean" },
      disabled: { reflect: true, type: "boolean" },
      inputValue: { attribute: "input-value", reflect: true, type: "string" },
      invalid: { reflect: true, type: "boolean" },
      loading: { reflect: true, type: "boolean" },
      noOptionsText: {
        attribute: "no-options-text",
        reflect: true,
        type: "string",
      },
      open: { reflect: true, type: "boolean" },
      openOnFocus: {
        attribute: "open-on-focus",
        reflect: true,
        type: "boolean",
      },
      options: { attribute: false },
      placeholder: { reflect: true, type: "string" },
      readOnly: { attribute: "readonly", reflect: true, type: "boolean" },
      value: { reflect: true, type: "string" },
    });

  readonly #listboxId = `vf-autocomplete-listbox-${++collectionSequence}`;
  readonly #controller: AutocompleteController<VyrnForgeAutocompleteOption> =
    createAutocompleteController<VyrnForgeAutocompleteOption>();
  #input: HTMLInputElement | null = null;
  #listbox: HTMLDivElement | null = null;

  get autoHighlight(): boolean {
    return this.getPropertyValue("autoHighlight", true);
  }
  set autoHighlight(value: boolean) {
    this.setPropertyValue("autoHighlight", Boolean(value));
  }

  get clearable(): boolean {
    return this.getPropertyValue("clearable", true);
  }
  set clearable(value: boolean) {
    this.setPropertyValue("clearable", Boolean(value));
  }

  get inputValue(): string {
    return this.getPropertyValue("inputValue", "");
  }
  set inputValue(value: string) {
    const normalized = String(value);
    this.#controller.syncInputValue(normalized);
    this.setPropertyValue("inputValue", normalized);
  }

  get invalid(): boolean {
    return this.getPropertyValue("invalid", false);
  }
  set invalid(value: boolean) {
    this.setPropertyValue("invalid", Boolean(value));
  }

  get loading(): boolean {
    return this.getPropertyValue("loading", false);
  }
  set loading(value: boolean) {
    this.setPropertyValue("loading", Boolean(value));
  }

  get noOptionsText(): string {
    return this.getPropertyValue("noOptionsText", "No options found");
  }
  set noOptionsText(value: string) {
    this.setPropertyValue("noOptionsText", String(value));
  }

  get open(): boolean {
    return this.getPropertyValue("open", false);
  }
  set open(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.syncOpen(normalized);
    this.setPropertyValue("open", normalized);
  }

  get openOnFocus(): boolean {
    return this.getPropertyValue("openOnFocus", false);
  }
  set openOnFocus(value: boolean) {
    this.setPropertyValue("openOnFocus", Boolean(value));
  }

  get options(): readonly VyrnForgeAutocompleteOption[] {
    return this.getPropertyValue("options", Object.freeze([]));
  }
  set options(value: readonly VyrnForgeAutocompleteOption[]) {
    const normalized = Object.freeze([...(value ?? [])]);
    this.#controller.replaceItems(normalized);
    this.setPropertyValue("options", normalized);
  }

  get placeholder(): string {
    return this.getPropertyValue("placeholder", "");
  }
  set placeholder(value: string) {
    this.setPropertyValue("placeholder", String(value));
  }

  get readOnly(): boolean {
    return this.getPropertyValue("readOnly", false);
  }
  set readOnly(value: boolean) {
    this.setPropertyValue("readOnly", Boolean(value));
  }

  get value(): string {
    return this.getPropertyValue("value", "");
  }
  set value(value: string) {
    const normalized = String(value ?? "");
    this.#controller.syncValue(normalized || null);
    this.setPropertyValue("value", normalized);
    this.syncFormContract();
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }

  clear(): void {
    if (this.disabled || this.readOnly) return;
    const previousValue = this.value;
    this.#controller.clear("programmatic");
    const snapshot = this.#controller.getSnapshot();
    this.commitSnapshot(
      snapshot.value ?? "",
      snapshot.inputValue,
      snapshot.open,
    );
    if (previousValue !== this.value) {
      this.dispatchTypedEvent("vf-value-change", {
        previousValue,
        reason: "clear",
        value: this.value || null,
      });
    }
  }

  protected override connected(): void {
    this.captureInitialFormState(this.value);
    this.ensureScaffold();
  }

  protected override resetFormState(state: string | undefined): void {
    this.value = state ?? "";
    const item = this.options.find((option) => option.value === this.value);
    this.inputValue = item?.label ?? "";
    this.open = false;
  }

  protected override restoreFormState(
    state: string,
    _mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.value = state;
  }

  protected override update(): void {
    this.#controller.replaceItems(this.options);
    this.#controller.syncValue(this.value || null);
    this.#controller.syncInputValue(this.inputValue);
    this.#controller.syncOpen(this.open);
    const snapshot = this.#controller.getSnapshot();
    const scaffold = this.ensureScaffold();
    if (!scaffold) return;

    this.applyManagedClasses([
      "vf-autocomplete",
      this.open && "vf-autocomplete--open",
      this.disabled && "vf-autocomplete--disabled",
      this.readOnly && "vf-autocomplete--read-only",
      this.invalid && "vf-autocomplete--invalid",
    ]);

    const { input, listbox } = scaffold;
    input.className = "vf-autocomplete__input vf-input";
    input.value = snapshot.inputValue;
    input.placeholder = this.placeholder;
    input.disabled = this.effectiveDisabled;
    input.readOnly = this.readOnly;
    input.required = this.required;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", this.#listboxId);
    input.setAttribute("aria-expanded", String(this.open));
    input.setAttribute("aria-invalid", String(this.invalid));
    const active = snapshot.activeValue;
    if (active)
      input.setAttribute(
        "aria-activedescendant",
        `${this.#listboxId}-${active}`,
      );
    else input.removeAttribute("aria-activedescendant");

    listbox.hidden = !this.open;
    listbox.replaceChildren();
    if (this.loading) {
      const status = this.resolveDocument()?.createElement("div");
      if (status) {
        status.className = "vf-autocomplete__status";
        status.setAttribute("role", "status");
        status.textContent = "Loading...";
        listbox.append(status);
      }
    } else if (snapshot.filteredItems.length === 0) {
      const status = this.resolveDocument()?.createElement("div");
      if (status) {
        status.className = "vf-autocomplete__status";
        status.textContent = this.noOptionsText;
        listbox.append(status);
      }
    } else {
      for (const option of snapshot.filteredItems) {
        listbox.append(
          this.createOption(option, snapshot.activeValue, snapshot.value),
        );
      }
    }

    this.syncFormContract();
    this.setAttribute("data-vf-element", "");
  }

  private ensureScaffold(): {
    input: HTMLInputElement;
    listbox: HTMLDivElement;
  } | null {
    if (this.#input?.isConnected && this.#listbox?.isConnected) {
      return { input: this.#input, listbox: this.#listbox };
    }
    const document = this.resolveDocument();
    if (!document) return null;
    const control = document.createElement("div");
    control.className = "vf-autocomplete__control";
    control.dataset.vfAutocompleteInternal = "";
    const input = document.createElement("input");
    input.dataset.vfAutocompleteInput = "";
    input.addEventListener("input", this.handleInput);
    input.addEventListener("keydown", this.handleKeyDown);
    input.addEventListener("focus", this.handleFocus);
    const actions = document.createElement("div");
    actions.className = "vf-autocomplete__actions";
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "vf-autocomplete__clear vf-icon-button";
    clear.textContent = "×";
    clear.setAttribute("aria-label", "Clear selection");
    clear.addEventListener("click", this.handleClear);
    const indicator = document.createElement("button");
    indicator.type = "button";
    indicator.className = "vf-autocomplete__indicator vf-icon-button";
    indicator.textContent = "⌄";
    indicator.setAttribute("aria-label", "Toggle options");
    indicator.addEventListener("click", this.handleToggle);
    actions.append(clear, indicator);
    control.append(input, actions);
    const listbox = document.createElement("div");
    listbox.id = this.#listboxId;
    listbox.className = "vf-autocomplete__listbox";
    listbox.setAttribute("role", "listbox");
    listbox.dataset.vfAutocompleteInternal = "";
    const external = [...this.childNodes].filter(
      (node) =>
        !(
          node instanceof Element &&
          node.hasAttribute("data-vf-autocomplete-internal")
        ),
    );
    this.replaceChildren(control, listbox, ...external);
    this.#input = input;
    this.#listbox = listbox;
    return { input, listbox };
  }

  private createOption(
    option: VyrnForgeAutocompleteOption,
    activeValue: string | null,
    selectedValue: string | null,
  ): HTMLElement {
    const document = this.resolveDocument();
    if (!document) throw new Error("Autocomplete requires a document");
    const item = document.createElement("div");
    item.id = `${this.#listboxId}-${option.value}`;
    item.className = [
      "vf-autocomplete__option",
      activeValue === option.value && "vf-autocomplete__option--active",
      selectedValue === option.value && "vf-autocomplete__option--selected",
      option.disabled && "vf-autocomplete__option--disabled",
    ]
      .filter(Boolean)
      .join(" ");
    item.dataset.value = option.value;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(selectedValue === option.value));
    if (option.disabled) item.setAttribute("aria-disabled", "true");
    const main = document.createElement("span");
    main.className = "vf-autocomplete__option-main";
    const label = document.createElement("span");
    label.className = "vf-autocomplete__option-label";
    label.textContent = option.label;
    main.append(label);
    if (option.description) {
      const description = document.createElement("span");
      description.className = "vf-autocomplete__option-description";
      description.textContent = option.description;
      main.append(description);
    }
    item.append(main);
    item.addEventListener("pointerdown", (event: PointerEvent) =>
      event.preventDefault(),
    );
    item.addEventListener("click", () =>
      this.selectOption(option.value, "pointer"),
    );
    return item;
  }

  private selectOption(value: string, reason: "keyboard" | "pointer"): void {
    if (this.disabled || this.readOnly) return;
    const previousValue = this.value;
    if (!this.#controller.select(value, reason)) return;
    const snapshot = this.#controller.getSnapshot();
    this.commitSnapshot(snapshot.value ?? "", snapshot.inputValue, false);
    this.dispatchTypedEvent("vf-value-change", {
      option:
        snapshot.items.find((item) => item.value === snapshot.value) ?? null,
      previousValue: previousValue || null,
      reason,
      value: snapshot.value,
    });
  }

  private setOpen(nextOpen: boolean, reason: string): void {
    if (nextOpen && (this.disabled || this.readOnly)) return;
    const previousOpen = this.open;
    this.#controller.setOpen(nextOpen, {
      reason: reason as "keyboard" | "pointer" | "programmatic",
    });
    const snapshot = this.#controller.getSnapshot();
    this.commitSnapshot(this.value, snapshot.inputValue, snapshot.open);
    if (previousOpen !== this.open) {
      this.dispatchTypedEvent("vf-open-change", {
        open: this.open,
        previousOpen,
        reason,
      });
    }
  }

  private commitSnapshot(
    value: string,
    inputValue: string,
    open: boolean,
  ): void {
    this.setPropertyValue("value", value);
    this.setPropertyValue("inputValue", inputValue);
    this.setPropertyValue("open", open);
    this.syncFormContract();
  }

  private syncFormContract(): void {
    const missing = this.required && !this.value;
    this.setFormValue(this.value || null, this.value);
    this.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? "Select a value." : "",
      this.#input ?? undefined,
    );
  }

  private readonly handleInput = (event: Event) => {
    if (this.disabled || this.readOnly) return;
    const value = (event.currentTarget as HTMLInputElement).value;
    this.#controller.setInputValue(value, "user");
    this.#controller.setOpen(true, { reason: "user" });
    const snapshot = this.#controller.getSnapshot();
    this.commitSnapshot(this.value, snapshot.inputValue, snapshot.open);
    this.dispatchTypedEvent("vf-input-value-change", {
      value: snapshot.inputValue,
    });
  };

  private readonly handleFocus = () => {
    if (this.openOnFocus) this.setOpen(true, "focus");
  };

  private readonly handleClear = () => this.clear();
  private readonly handleToggle = () => this.setOpen(!this.open, "pointer");

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (this.disabled || this.readOnly) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!this.open) this.setOpen(true, "keyboard");
      this.#controller.moveActive(
        event.key === "ArrowDown" ? "next" : "previous",
        "keyboard",
      );
      this.requestUpdate();
    } else if (event.key === "Home" && this.open) {
      event.preventDefault();
      this.#controller.moveActive("first", "keyboard");
      this.requestUpdate();
    } else if (event.key === "End" && this.open) {
      event.preventDefault();
      this.#controller.moveActive("last", "keyboard");
      this.requestUpdate();
    } else if (event.key === "Enter" && this.open) {
      event.preventDefault();
      const active = this.#controller.getSnapshot().activeValue;
      if (active) this.selectOption(active, "keyboard");
    } else if (event.key === "Escape" && this.open) {
      event.preventDefault();
      this.setOpen(false, "escape-key");
    }
  };
}

abstract class VyrnForgeStringArrayFormElement extends VyrnForgeFormDomElement {
  protected syncArrayFormValue(values: readonly string[]): void {
    const FormDataConstructor = globalThis.FormData;
    if (this.name && FormDataConstructor) {
      const data = new FormDataConstructor();
      for (const value of values) data.append(this.name, value);
      this.setFormValue(values.length > 0 ? data : null, values.join(","));
    } else {
      this.setFormValue(
        values.length > 0 ? values.join(",") : null,
        values.join(","),
      );
    }
    const missing = this.required && values.length === 0;
    this.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? "Select at least one value." : "",
    );
  }

  protected override restoreFormState(
    state: string,
    _mode: VyrnForgeFormStateRestoreMode,
  ): void {
    this.restoreValues(state ? state.split(",") : []);
  }

  protected abstract restoreValues(values: readonly string[]): void;
}

export class VyrnForgeMultiSelectElement extends VyrnForgeStringArrayFormElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      clearable: { reflect: true, type: "boolean" },
      disabled: { reflect: true, type: "boolean" },
      invalid: { reflect: true, type: "boolean" },
      open: { reflect: true, type: "boolean" },
      options: { attribute: false },
      placeholder: { reflect: true, type: "string" },
      searchable: { reflect: true, type: "boolean" },
      value: { attribute: false },
    });

  readonly #controller: MultiSelectController<VyrnForgeMultiSelectOption> =
    createMultiSelectController<VyrnForgeMultiSelectOption>();

  get clearable(): boolean {
    return this.getPropertyValue("clearable", true);
  }
  set clearable(value: boolean) {
    this.setPropertyValue("clearable", Boolean(value));
  }
  get invalid(): boolean {
    return this.getPropertyValue("invalid", false);
  }
  set invalid(value: boolean) {
    this.setPropertyValue("invalid", Boolean(value));
  }
  get open(): boolean {
    return this.getPropertyValue("open", false);
  }
  set open(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.setOpen(normalized);
    this.setPropertyValue("open", normalized);
  }
  get options(): readonly VyrnForgeMultiSelectOption[] {
    return this.getPropertyValue("options", Object.freeze([]));
  }
  set options(value: readonly VyrnForgeMultiSelectOption[]) {
    const normalized = Object.freeze([...(value ?? [])]);
    this.#controller.replaceItems(normalized);
    this.setPropertyValue("options", normalized);
  }
  get placeholder(): string {
    return this.getPropertyValue("placeholder", "Select options");
  }
  set placeholder(value: string) {
    this.setPropertyValue("placeholder", String(value));
  }
  get searchable(): boolean {
    return this.getPropertyValue("searchable", false);
  }
  set searchable(value: boolean) {
    this.setPropertyValue("searchable", Boolean(value));
  }
  get value(): readonly string[] {
    return this.getPropertyValue("value", Object.freeze([]));
  }
  set value(value: readonly string[]) {
    const normalized = freezeStrings(value ?? []);
    this.#controller.syncValues(normalized);
    this.setPropertyValue("value", normalized);
    this.syncArrayFormValue(normalized);
  }

  clear(): void {
    if (this.effectiveDisabled) return;
    const previousValue = this.value;
    this.#controller.clear("programmatic");
    this.commitValue(
      this.#controller.getSnapshot().selectedValues,
      previousValue,
      "clear",
    );
  }

  protected override connected(): void {
    this.captureInitialFormState(this.value.join(","));
  }
  protected override resetFormState(state: string | undefined): void {
    this.value = state ? state.split(",") : Object.freeze([]);
  }
  protected override restoreValues(values: readonly string[]): void {
    this.value = values;
  }

  protected override update(): void {
    this.#controller.replaceItems(this.options);
    this.#controller.syncValues(this.value);
    this.#controller.setOpen(this.open);
    this.applyManagedClasses([
      "vf-multi-select",
      this.invalid && "vf-multi-select--invalid",
    ]);
    const document = this.resolveDocument();
    if (!document) return;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "vf-multi-select__trigger";
    trigger.disabled = this.effectiveDisabled;
    trigger.setAttribute("aria-expanded", String(this.open));
    trigger.addEventListener("click", () => {
      this.open = !this.open;
    });
    const value = document.createElement("span");
    value.className = "vf-multi-select__value";
    if (this.value.length === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "vf-multi-select__placeholder";
      placeholder.textContent = this.placeholder;
      value.append(placeholder);
    } else {
      for (const selected of this.value) {
        const chip = document.createElement("span");
        chip.className = "vf-multi-select__chip";
        chip.textContent =
          this.options.find((item) => item.value === selected)?.label ??
          selected;
        value.append(chip);
      }
    }
    const chevron = document.createElement("span");
    chevron.className = "vf-multi-select__chevron";
    chevron.textContent = "⌄";
    trigger.append(value, chevron);

    const popover = document.createElement("div");
    popover.className = "vf-multi-select__popover";
    popover.hidden = !this.open;
    if (this.searchable) {
      const search = document.createElement("input");
      search.className = "vf-multi-select__search vf-input";
      search.placeholder = "Search options";
      search.value = this.#controller.getSnapshot().query;
      search.addEventListener("input", (event: Event) => {
        this.#controller.setQuery(
          (event.currentTarget as HTMLInputElement).value,
          "user",
        );
        this.requestUpdate();
      });
      popover.append(search);
    }
    const list = document.createElement("div");
    list.className = "vf-multi-select__list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-multiselectable", "true");
    const snapshot = this.#controller.getSnapshot();
    for (const option of snapshot.filteredItems) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = [
        "vf-multi-select__option",
        snapshot.selectedValues.includes(option.value) &&
          "vf-multi-select__option--selected",
        snapshot.activeValue === option.value &&
          "vf-multi-select__option--active",
        option.disabled && "vf-multi-select__option--disabled",
      ]
        .filter(Boolean)
        .join(" ");
      button.disabled = option.disabled === true;
      button.dataset.value = option.value;
      button.setAttribute("role", "option");
      button.setAttribute(
        "aria-selected",
        String(snapshot.selectedValues.includes(option.value)),
      );
      button.textContent = option.label;
      button.addEventListener("click", () => this.toggleOption(option.value));
      list.append(button);
    }
    popover.append(list);
    this.replaceChildren(trigger, popover);
    this.syncArrayFormValue(this.value);
    this.setAttribute("data-vf-element", "");
  }

  private toggleOption(value: string): void {
    if (this.effectiveDisabled) return;
    const previousValue = this.value;
    this.#controller.toggle(value, "pointer");
    this.commitValue(
      this.#controller.getSnapshot().selectedValues,
      previousValue,
      "selection",
    );
  }

  private commitValue(
    values: readonly string[],
    previousValue: readonly string[],
    reason: string,
  ): void {
    const normalized = freezeStrings(values);
    this.setPropertyValue("value", normalized);
    this.syncArrayFormValue(normalized);
    this.dispatchTypedEvent("vf-value-change", {
      previousValue,
      reason,
      value: normalized,
    });
  }
}

export class VyrnForgeTransferListElement extends VyrnForgeStringArrayFormElement {
  static override readonly properties: VyrnForgePropertyDeclarations =
    Object.freeze({
      clearSelectionAfterMove: {
        attribute: "clear-selection-after-move",
        reflect: true,
        type: "boolean",
      },
      disabled: { reflect: true, type: "boolean" },
      moveAll: { attribute: "move-all", reflect: true, type: "boolean" },
      options: { attribute: false },
      readOnly: { attribute: "readonly", reflect: true, type: "boolean" },
      searchable: { reflect: true, type: "boolean" },
      sourceTitle: { attribute: "source-title", reflect: true, type: "string" },
      targetTitle: { attribute: "target-title", reflect: true, type: "string" },
      value: { attribute: false },
    });

  readonly #controller: TransferListController<VyrnForgeTransferListOption> =
    createTransferListController<VyrnForgeTransferListOption>();

  get clearSelectionAfterMove(): boolean {
    return this.getPropertyValue("clearSelectionAfterMove", true);
  }
  set clearSelectionAfterMove(value: boolean) {
    const normalized = Boolean(value);
    this.#controller.setClearSelectionAfterMove(normalized);
    this.setPropertyValue("clearSelectionAfterMove", normalized);
  }
  get moveAll(): boolean {
    return this.getPropertyValue("moveAll", true);
  }
  set moveAll(value: boolean) {
    this.setPropertyValue("moveAll", Boolean(value));
  }
  get options(): readonly VyrnForgeTransferListOption[] {
    return this.getPropertyValue("options", Object.freeze([]));
  }
  set options(value: readonly VyrnForgeTransferListOption[]) {
    const normalized = Object.freeze([...(value ?? [])]);
    this.#controller.replaceItems(normalized);
    this.setPropertyValue("options", normalized);
  }
  get readOnly(): boolean {
    return this.getPropertyValue("readOnly", false);
  }
  set readOnly(value: boolean) {
    this.setPropertyValue("readOnly", Boolean(value));
  }
  get searchable(): boolean {
    return this.getPropertyValue("searchable", true);
  }
  set searchable(value: boolean) {
    this.setPropertyValue("searchable", Boolean(value));
  }
  get sourceTitle(): string {
    return this.getPropertyValue("sourceTitle", "Available");
  }
  set sourceTitle(value: string) {
    this.setPropertyValue("sourceTitle", String(value));
  }
  get targetTitle(): string {
    return this.getPropertyValue("targetTitle", "Assigned");
  }
  set targetTitle(value: string) {
    this.setPropertyValue("targetTitle", String(value));
  }
  get value(): readonly string[] {
    return this.getPropertyValue("value", Object.freeze([]));
  }
  set value(value: readonly string[]) {
    const normalized = freezeStrings(value ?? []);
    this.#controller.syncValue(normalized);
    this.setPropertyValue("value", normalized);
    this.syncArrayFormValue(normalized);
  }

  protected override connected(): void {
    this.captureInitialFormState(this.value.join(","));
  }
  protected override resetFormState(state: string | undefined): void {
    this.value = state ? state.split(",") : Object.freeze([]);
  }
  protected override restoreValues(values: readonly string[]): void {
    this.value = values;
  }

  protected override update(): void {
    this.#controller.replaceItems(this.options);
    this.#controller.syncValue(this.value);
    this.#controller.setClearSelectionAfterMove(this.clearSelectionAfterMove);
    this.applyManagedClasses([
      "vf-transfer-list",
      this.effectiveDisabled && "vf-transfer-list--disabled",
    ]);
    const document = this.resolveDocument();
    if (!document) return;
    const snapshot = this.#controller.getSnapshot();
    const source = this.createPanel(
      document,
      "source",
      this.sourceTitle,
      snapshot.visibleSourceItems,
      snapshot.sourceSelectedValues,
    );
    const target = this.createPanel(
      document,
      "target",
      this.targetTitle,
      snapshot.visibleTargetItems,
      snapshot.targetSelectedValues,
    );
    const actions = document.createElement("div");
    actions.className = "vf-transfer-list__actions";
    actions.append(
      this.createMoveButton(document, "target", "Move selected right", "→"),
      this.createMoveButton(document, "source", "Move selected left", "←"),
    );
    if (this.moveAll) {
      actions.append(
        this.createMoveButton(document, "target", "Move all right", "≫", true),
        this.createMoveButton(document, "source", "Move all left", "≪", true),
      );
    }
    this.replaceChildren(source, actions, target);
    this.syncArrayFormValue(this.value);
    this.setAttribute("data-vf-element", "");
  }

  private createPanel(
    document: Document,
    panel: TransferListPanel,
    title: string,
    items: readonly VyrnForgeTransferListOption[],
    selectedValues: readonly string[],
  ): HTMLElement {
    const section = document.createElement("section");
    section.className = "vf-transfer-list__panel";
    const heading = document.createElement("h3");
    heading.className = "vf-transfer-list__title";
    heading.textContent = title;
    section.append(heading);
    if (this.searchable) {
      const search = document.createElement("input");
      search.className = "vf-transfer-list__search vf-input";
      search.placeholder = `Search ${title.toLocaleLowerCase()}`;
      search.addEventListener("input", (event: Event) => {
        this.#controller.setQuery(
          panel,
          (event.currentTarget as HTMLInputElement).value,
        );
        this.requestUpdate();
      });
      section.append(search);
    }
    const options = document.createElement("div");
    options.className = "vf-transfer-list__options";
    options.setAttribute("role", "group");
    for (const item of items) {
      const label = document.createElement("label");
      label.className = [
        "vf-transfer-list__option",
        selectedValues.includes(item.value) &&
          "vf-transfer-list__option--selected",
        item.disabled && "vf-transfer-list__option--disabled",
      ]
        .filter(Boolean)
        .join(" ");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = selectedValues.includes(item.value);
      input.disabled =
        this.effectiveDisabled || this.readOnly || item.disabled === true;
      input.dataset.value = item.value;
      input.addEventListener("change", () => {
        this.#controller.toggleSelection(panel, item.value, "selection");
        this.dispatchTypedEvent(
          "vf-selection-change",
          this.#controller.getSnapshot(),
        );
        this.requestUpdate();
      });
      const text = document.createElement("span");
      text.textContent = item.label;
      label.append(input, text);
      options.append(label);
    }
    section.append(options);
    return section;
  }

  private createMoveButton(
    document: Document,
    to: TransferListPanel,
    label: string,
    text: string,
    all = false,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vf-button vf-button--subtle vf-button--sm";
    button.setAttribute("aria-label", label);
    button.textContent = text;
    button.disabled = this.effectiveDisabled || this.readOnly;
    button.addEventListener("click", () => {
      const previousValue = this.value;
      const changed = all
        ? this.#controller.moveAll(to, "selection")
        : this.#controller.moveSelected(to, "selection");
      if (!changed) return;
      const snapshot = this.#controller.getSnapshot();
      const normalized = freezeStrings(snapshot.targetValues);
      this.setPropertyValue("value", normalized);
      this.syncArrayFormValue(normalized);
      this.dispatchTypedEvent("vf-value-change", {
        previousValue,
        reason: all ? "move-all" : "move-selected",
        value: normalized,
      });
      this.requestUpdate();
    });
    return button;
  }
}
