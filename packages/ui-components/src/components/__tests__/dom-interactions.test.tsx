import { useState } from "react";
import { act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Autocomplete,
  Button,
  Dialog,
  MultiSelect,
  Tabs,
  ToastProvider,
  useToast,
} from "../../index";
import {
  createUser,
  getPortalRoot,
  render,
  screen,
  within,
} from "../../../../../tests/dom";

const tabItems = [
  { id: "summary", label: "Summary", content: "Summary panel" },
  { id: "billing", label: "Billing", content: "Billing panel", disabled: true },
  { id: "activity", label: "Activity", content: "Activity panel" },
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

    render(
      <Button disabled onClick={onClick}>
        Save changes
      </Button>,
    );

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
      />,
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
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
  });

  it("selects and clears Autocomplete values from keyboard interaction", async () => {
    const onValueChange = vi.fn();
    const user = createUser();

    render(
      <Autocomplete
        ariaLabel="Workspace role"
        onValueChange={onValueChange}
        openOnFocus
        options={[
          { value: "admin", label: "Administrator" },
          { value: "operator", label: "Operator", disabled: true },
          { value: "viewer", label: "Viewer" },
        ]}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Workspace role" });
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("Viewer");
    expect(onValueChange).toHaveBeenCalledWith(
      "viewer",
      expect.objectContaining({ value: "viewer" }),
    );

    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(input).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith(null, null);
  });

  it("uses roving focus and persistent selection in MultiSelect", async () => {
    const onValueChange = vi.fn();
    const user = createUser();

    render(
      <MultiSelect
        aria-label="Workspace permissions"
        defaultValue={["owner"]}
        onValueChange={onValueChange}
        options={[
          { value: "owner", label: "Owner" },
          { value: "approver", label: "Approver" },
          { value: "billing", label: "Billing", disabled: true },
          { value: "viewer", label: "Viewer" },
        ]}
        searchable
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Workspace permissions",
    });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    const owner = screen.getByRole("option", { name: "Owner" });
    const approver = screen.getByRole("option", { name: "Approver" });
    const viewer = screen.getByRole("option", { name: "Viewer" });
    await vi.waitFor(() => expect(owner).toHaveFocus());
    expect(owner).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(approver).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(approver).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["owner", "approver"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(viewer).toHaveFocus());
    expect(screen.getByRole("option", { name: "Billing" })).toBeDisabled();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await vi.waitFor(() => expect(trigger).toHaveFocus());
  });

  it("filters and clears MultiSelect values", async () => {
    const user = createUser();

    render(
      <MultiSelect
        aria-label="Workspace permissions"
        defaultValue={["owner"]}
        options={[
          { value: "owner", label: "Owner" },
          { value: "viewer", label: "Viewer" },
        ]}
        searchable
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Workspace permissions" }),
    );
    await user.type(
      screen.getByRole("searchbox", { name: "Search options" }),
      "view",
    );
    expect(screen.getByRole("option", { name: "Viewer" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Owner" })).toBeNull();

    await user.click(screen.getByRole("option", { name: "Viewer" }));
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByText("Select options")).toBeInTheDocument();
  });

  it("supports timed, persistent, and hover-paused Toast feedback", async () => {
    vi.useFakeTimers();

    function ToastHarness() {
      const toast = useToast();

      return (
        <>
          <button
            onClick={() =>
              toast.success({
                id: "timed",
                title: "Saved",
                duration: 500,
              })
            }
            type="button"
          >
            Show timed
          </button>
          <button
            onClick={() =>
              toast.warning({
                id: "persistent",
                title: "Sync delayed",
                duration: null,
              })
            }
            type="button"
          >
            Show persistent
          </button>
          <button
            onClick={() =>
              toast.info({
                id: "pausable",
                title: "Export ready",
                duration: 500,
              })
            }
            type="button"
          >
            Show pausable
          </button>
        </>
      );
    }

    render(
      <ToastProvider defaultDuration={1000}>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show timed" }));
    const timed = screen.getByRole("status");
    expect(timed).toHaveTextContent("Saved");
    await act(async () => vi.advanceTimersByTimeAsync(500));
    expect(screen.queryByRole("status")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show persistent" }));
    const persistent = screen.getByRole("alert");
    expect(persistent).toHaveTextContent("Sync delayed");
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(persistent).toBeInTheDocument();
    fireEvent.click(
      within(persistent).getByRole("button", { name: "Dismiss notification" }),
    );
    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show pausable" }));
    const pausable = screen.getByRole("status");
    expect(pausable).toHaveTextContent("Export ready");
    fireEvent.mouseEnter(pausable);
    await act(async () => vi.advanceTimersByTimeAsync(700));
    expect(pausable).toBeInTheDocument();
    fireEvent.mouseLeave(pausable);
    await act(async () => vi.advanceTimersByTimeAsync(500));
    expect(screen.queryByRole("status")).toBeNull();
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
      </Dialog>,
    );

    expect(
      within(portalRoot).getByRole("dialog", { name: "Review changes" }),
    ).toBeInTheDocument();
  });

  it("starts each test with an empty portal root", () => {
    expect(getPortalRoot()).toBeEmptyDOMElement();
  });
});
