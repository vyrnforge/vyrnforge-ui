import { describe, expect, it, vi } from "vitest";
import {
  createAutocompleteController,
  defaultAutocompleteBehaviorFilter,
  getNextEnabledAutocompleteIndex,
  type AutocompleteItem,
} from "./autocomplete";

const items: readonly AutocompleteItem[] = [
  { value: "admin", label: "Administrator", keywords: ["owner"] },
  { value: "editor", label: "Editor", disabled: true },
  { value: "viewer", label: "Viewer", keywords: ["read"] },
];

describe("autocomplete behavior", () => {
  it("filters by label and keywords", () => {
    expect(defaultAutocompleteBehaviorFilter(items, "ADMIN")).toHaveLength(1);
    expect(defaultAutocompleteBehaviorFilter(items, "read")[0]?.value).toBe(
      "viewer",
    );
  });

  it("skips disabled options during wrapped navigation", () => {
    expect(getNextEnabledAutocompleteIndex(items, 0, 1)).toBe(2);
    expect(getNextEnabledAutocompleteIndex(items, 2, 1)).toBe(0);
  });

  it("opens with automatic highlight and selects enabled values", () => {
    const events = vi.fn();
    const controller = createAutocompleteController({ items, onEvent: events });

    controller.setOpen(true, { direction: 1, reason: "keyboard" });
    expect(controller.getSnapshot().activeValue).toBe("admin");

    controller.moveActive("next");
    expect(controller.getSnapshot().activeValue).toBe("viewer");

    controller.select("viewer");
    expect(controller.getSnapshot()).toMatchObject({
      value: "viewer",
      inputValue: "Viewer",
      open: false,
    });
    expect(events).toHaveBeenCalled();
  });

  it("rejects disabled selection and restores the selected label", () => {
    const controller = createAutocompleteController({
      items,
      defaultValue: "admin",
    });

    controller.setInputValue("temporary");
    expect(controller.select("editor")).toBe(false);
    controller.restoreInputValue();
    expect(controller.getSnapshot().inputValue).toBe("Administrator");
  });

  it("emits controlled proposals and waits for synchronization", () => {
    const events = vi.fn();
    const controller = createAutocompleteController({
      items,
      value: "admin",
      inputValue: "Administrator",
      open: false,
      onEvent: events,
    });

    controller.select("viewer");
    expect(controller.getSnapshot().value).toBe("admin");
    expect(events).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "value-change",
        detail: expect.objectContaining({
          value: "viewer",
          isControlled: true,
        }),
      }),
    );

    controller.syncValue("viewer");
    expect(controller.getSnapshot().value).toBe("viewer");
  });

  it("normalizes duplicate item values and explicit order", () => {
    const controller = createAutocompleteController({
      items: [
        { value: "late", label: "Late", order: 2 },
        { value: "early", label: "Early", order: 1 },
        { value: "late", label: "Duplicate", order: 0 },
      ],
    });

    expect(controller.getSnapshot().items.map((item) => item.value)).toEqual([
      "early",
      "late",
    ]);
  });

  it("supports manual highlighting and direct active-value changes", () => {
    const controller = createAutocompleteController({
      items,
      autoHighlight: false,
      defaultOpen: true,
    });

    expect(controller.getSnapshot().activeValue).toBeNull();
    expect(controller.setActiveValue("editor")).toBe(false);
    expect(controller.setActiveValue("viewer")).toBe(true);
    expect(controller.setActiveValue("viewer")).toBe(false);
    expect(controller.setActiveValue(null)).toBe(true);
  });

  it("covers first, last, previous, and empty active movement", () => {
    const controller = createAutocompleteController({ items });
    controller.setOpen(true);

    expect(controller.moveActive("last")).toBe("viewer");
    expect(controller.moveActive("previous")).toBe("admin");
    expect(controller.moveActive("first")).toBe("admin");

    controller.replaceItems([]);
    expect(controller.moveActive("next")).toBeNull();
  });

  it("updates filters and item collections without duplicate publishes", () => {
    const controller = createAutocompleteController({ items });
    const filter = (currentItems: readonly AutocompleteItem[]) =>
      currentItems.slice(0, 1);

    expect(controller.setFilter(filter)).toBe(true);
    expect(controller.setFilter(filter)).toBe(false);
    expect(controller.getSnapshot().filteredItems).toHaveLength(1);
    expect(controller.replaceItems(items)).toBe(false);
    expect(
      controller.replaceItems([...items, { value: "audit", label: "Audit" }]),
    ).toBe(true);
  });

  it("synchronizes controlled input and open state without callbacks", () => {
    const events = vi.fn();
    const controller = createAutocompleteController({
      items,
      inputValue: "Admin",
      open: false,
      onEvent: events,
    });

    expect(controller.syncInputValue("Admin")).toBe(false);
    expect(controller.syncInputValue("Viewer")).toBe(true);
    expect(controller.syncOpen(false)).toBe(false);
    expect(controller.syncOpen(true)).toBe(true);
    expect(events).not.toHaveBeenCalled();
  });

  it("covers clear and same-value selection no-op paths", () => {
    const controller = createAutocompleteController({
      items,
      defaultValue: "admin",
    });

    expect(controller.select("admin")).toBe(false);
    expect(controller.clear()).toBe(true);
    expect(controller.clear()).toBe(false);
    expect(controller.select("missing")).toBe(false);
  });

  it("dispatches every public autocomplete command", () => {
    const controller = createAutocompleteController({ items });
    const filter = (currentItems: readonly AutocompleteItem[]) => currentItems;
    controller.setFilter(filter);

    controller.dispatch({ type: "set-input", value: "view" });
    controller.dispatch({ type: "set-open", open: true, direction: -1 });
    controller.dispatch({ type: "move-active", intent: "first" });
    controller.dispatch({ type: "set-active", value: "viewer" });
    controller.dispatch({ type: "select", value: "viewer" });
    controller.dispatch({ type: "clear" });
    controller.dispatch({ type: "replace-items", items });
    controller.dispatch({ type: "sync-value", value: "admin" });
    controller.dispatch({ type: "sync-input", value: "Administrator" });
    controller.dispatch({ type: "sync-open", open: false });

    expect(controller.getSnapshot()).toMatchObject({
      value: "admin",
      inputValue: "Administrator",
      open: false,
    });
  });
});
