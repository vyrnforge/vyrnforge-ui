import { describe, expect, it, vi } from "vitest";
import { createToggleGroupController } from "./toggle-group";

describe("toggle group behavior", () => {
  it("supports single selection, array normalization, and clearing", () => {
    const controller = createToggleGroupController<string>({
      defaultValue: ["table", "ignored"],
    });

    expect(controller.getValue()).toBe("table");
    controller.toggle("board");
    expect(controller.getValue()).toBe("board");
    controller.toggle("board");
    expect(controller.getValue()).toBe("");
  });

  it("supports multiple selection and empty defaults", () => {
    const controller = createToggleGroupController<string>({
      type: "multiple",
      defaultValue: "bold",
    });

    controller.toggle("italic");
    expect(controller.getValue()).toEqual(["bold", "italic"]);

    const empty = createToggleGroupController<string>({ type: "multiple" });
    expect(empty.getValue()).toEqual([]);
  });

  it("emits controlled proposals and accepts synchronized values", () => {
    const onValueChange = vi.fn();
    const controller = createToggleGroupController<string>({
      type: "multiple",
      value: ["bold"],
      onValueChange,
    });

    controller.toggle("italic", "pointer");
    expect(controller.getValue()).toEqual(["bold"]);
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "pointer",
        detail: expect.objectContaining({ selectedKeys: ["bold", "italic"] }),
      }),
    );
    expect(controller.syncValue(["bold", "italic"])).toBe(true);
    expect(controller.syncValue(["bold", "italic"])).toBe(false);
  });
});
