import { act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  ConfirmDialog,
  Dialog,
  Drawer,
  Popover,
  ToastProvider,
  Tooltip,
  useToast,
} from "../../index";
import { render, screen } from "../../../../../tests/dom";

describe("React overlay and feedback adapters preserve shared behavior parity", () => {
  it("routes dialog and drawer dismissals through component controllers", () => {
    const onDialogOpenChange = vi.fn();
    const onDrawerOpenChange = vi.fn();

    render(
      <>
        <Dialog onOpenChange={onDialogOpenChange} open title="Delete account">
          Dialog body
        </Dialog>
        <Drawer onOpenChange={onDrawerOpenChange} open title="Filters">
          Drawer body
        </Drawer>
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onDialogOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Close drawer" }));
    expect(onDrawerOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps popover trigger and content relationships synchronized", () => {
    const onOpenChange = vi.fn();

    render(
      <Popover
        defaultOpen
        onOpenChange={onOpenChange}
        trigger={<Button>Details</Button>}
      >
        Popover details
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Details" });
    const content = screen.getByText("Popover details");
    expect(trigger).toHaveAttribute("aria-controls", content.id);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("opens and dismisses tooltip state through the shared controller", () => {
    vi.useFakeTimers();

    render(
      <Tooltip content="Helpful hint" delayMs={100}>
        <Button>Help</Button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Help" });
    fireEvent.focus(trigger);
    act(() => vi.advanceTimersByTime(100));

    expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful hint");
    expect(trigger).toHaveAttribute(
      "aria-describedby",
      screen.getByRole("tooltip").id,
    );

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("routes ConfirmDialog actions through the shared confirmation controller", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        onCancel={onCancel}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        open
        title="Confirm change"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("uses the shared Toast queue while React owns timer execution", () => {
    function Harness() {
      const toast = useToast();
      return (
        <>
          <Button
            onClick={() =>
              toast.toast({
                id: "one",
                title: "First notification",
                duration: null,
              })
            }
          >
            Add toast
          </Button>
          <Button
            onClick={() =>
              toast.update("one", { title: "Updated notification" })
            }
          >
            Update toast
          </Button>
          <Button onClick={() => toast.dismiss("one")}>Dismiss toast</Button>
        </>
      );
    }

    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add toast" }));
    expect(screen.getByText("First notification")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Update toast" }));
    expect(screen.getByText("Updated notification")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss toast" }));
    expect(screen.queryByText("Updated notification")).not.toBeInTheDocument();
  });
});
