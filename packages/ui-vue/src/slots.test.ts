import { Fragment, createTextVNode, h } from "vue";
import { describe, expect, it } from "vitest";

import { renderVyrnForgeSlots } from "./slots";

describe("Vue slot composition bridge", () => {
  it("preserves default slot roots without adding wrapper nodes", () => {
    const child = h("strong", { "data-default": "true" }, "Default");
    const rendered = renderVyrnForgeSlots({ default: () => [child] });

    expect(rendered).toHaveLength(1);
    expect(rendered[0]).toBe(child);
  });

  it("assigns named slots to element roots without inserting wrappers", () => {
    const child = h(
      "button",
      { type: "button", "data-trigger": "preserved" },
      "Trigger",
    );
    const rendered = renderVyrnForgeSlots({ trigger: () => [child] });

    expect(rendered).toHaveLength(1);
    expect(rendered[0]?.type).toBe("button");
    expect(rendered[0]?.props?.slot).toBe("trigger");
    expect(rendered[0]?.props?.["data-trigger"]).toBe("preserved");
    expect(rendered[0]).not.toBe(child);
  });

  it("flattens fragment roots while preserving named-slot assignment", () => {
    const rendered = renderVyrnForgeSlots({
      actions: () => [
        h(Fragment, null, [
          h("button", { "data-action": "first" }, "First"),
          h("button", { "data-action": "second" }, "Second"),
        ]),
      ],
    });

    expect(rendered).toHaveLength(2);
    expect(rendered.every((node) => node.props?.slot === "actions")).toBe(true);
  });

  it("uses the smallest valid wrapper only for non-element named roots", () => {
    const rendered = renderVyrnForgeSlots({
      description: () => [createTextVNode("Description")],
    });

    expect(rendered).toHaveLength(1);
    expect(rendered[0]?.type).toBe("span");
    expect(rendered[0]?.props?.slot).toBe("description");
  });

  it("emits no child for an omitted optional named slot", () => {
    expect(renderVyrnForgeSlots({})).toEqual([]);
  });
});
