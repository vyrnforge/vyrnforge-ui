import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, Dialog, Tabs } from "../../index";
import { createUser, getPortalRoot, render, screen, within } from "../../../test/dom";

const tabItems = [
  { id: "summary", label: "Summary", content: "Summary panel" },
  { id: "billing", label: "Billing", content: "Billing panel", disabled: true },
  { id: "activity", label: "Activity", content: "Activity panel" }
];

describe("@vyrnforge/ui-components DOM interactions", () => {
  it("focuses and activates an enabled Button", async () => {
    const onClick = vi.fn();
    const user = createUser();

    render(<Button onClick={onClick}>Save changes</Button>);

    const button = screen.getByRole("button", { name: "Save changes" });
    await user.tab();
    expect(button).toHaveFocus();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not activate a disabled Button", async () => {
    const onClick = vi.fn();
    const user = createUser();

    render(<Button disabled onClick={onClick}>Save changes</Button>);

    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("updates uncontrolled Tabs from keyboard interaction and skips disabled tabs", async () => {
    const onValueChange = vi.fn();
    const user = createUser();

    render(
      <Tabs
        defaultValue="summary"
        items={tabItems}
        onValueChange={onValueChange}
      />
    );

    const summary = screen.getByRole("tab", { name: "Summary" });
    const activity = screen.getByRole("tab", { name: "Activity" });
    const billing = screen.getByRole("tab", { name: "Billing" });

    summary.focus();
    await user.keyboard("{ArrowRight}");

    expect(activity).toHaveFocus();
    expect(activity).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
    expect(onValueChange).toHaveBeenCalledWith("activity");
    expect(billing).toBeDisabled();

    await user.click(billing);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("keeps controlled Tabs in sync with the owning component", async () => {
    const onValueChange = vi.fn();
    const user = createUser();

    function ControlledTabs() {
      const [value, setValue] = useState("summary");

      return (
        <Tabs
          items={tabItems}
          onValueChange={(nextValue) => {
            onValueChange(nextValue);
            setValue(nextValue);
          }}
          value={value}
        />
      );
    }

    render(<ControlledTabs />);

    await user.click(screen.getByRole("tab", { name: "Activity" }));

    expect(onValueChange).toHaveBeenCalledWith("activity");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
  });

  it("renders portals into the shared test portal root", async () => {
    const portalRoot = getPortalRoot();

    render(
      <Dialog
        onOpenChange={() => undefined}
        open
        portalContainer={portalRoot}
        title="Review changes"
      >
        Confirm the pending updates.
      </Dialog>
    );

    expect(within(portalRoot).getByRole("dialog", { name: "Review changes" })).toBeInTheDocument();
  });

  it("starts each test with an empty portal root", () => {
    expect(getPortalRoot()).toBeEmptyDOMElement();
  });
});
