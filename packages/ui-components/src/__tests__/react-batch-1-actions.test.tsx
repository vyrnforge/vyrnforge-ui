import { fireEvent, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../../tests/dom";
import { Button, IconButton } from "../index";

describe("MFD-1409 React action facade migration", () => {
  it("preserves stable SSR markup with a native button inside the canonical host", () => {
    const markup = renderToStaticMarkup(
      <Button className="consumer-button" loading variant="primary">
        Save
      </Button>,
    );

    expect(markup).toContain("<vf-button");
    expect(markup).toContain("<button");
    expect(markup).toContain('data-vf-action-control=""');
    expect(markup).toContain("vf-button--primary");
    expect(markup).toContain("consumer-button");
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('aria-busy="true"');
  });

  it("keeps the public Button ref and native event surface on HTMLButtonElement", async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { rerender } = render(
      <Button
        className="consumer-button"
        data-testid="action"
        onClick={onClick}
        ref={ref}
        variant="primary"
      >
        Save
      </Button>,
    );

    const control = screen.getByTestId("action");
    expect(ref.current).toBe(control);
    expect(ref.current?.tagName).toBe("BUTTON");
    expect(control.closest("vf-button")).not.toBeNull();
    expect(customElements.get("vf-button")).toBeDefined();

    fireEvent.click(control);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button
        className="consumer-updated"
        data-testid="action"
        onClick={onClick}
        ref={ref}
        variant="danger"
      >
        Save
      </Button>,
    );

    await waitFor(() => {
      expect(control).toHaveClass("consumer-updated");
      expect(control).toHaveClass("vf-button--danger");
    });
    expect(control).not.toHaveClass("consumer-button");
  });

  it("keeps IconButton accessibility on the native control while canonical-backed", async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton aria-label="Refresh" className="consumer-icon" ref={ref}>
        R
      </IconButton>,
    );

    const control = screen.getByRole("button", { name: "Refresh" });
    expect(ref.current).toBe(control);
    expect(control.closest("vf-icon-button")).not.toBeNull();
    expect(customElements.get("vf-icon-button")).toBeDefined();

    await waitFor(() => {
      expect(control).toHaveClass("vf-icon-button");
      expect(control).toHaveClass("consumer-icon");
    });
  });
});
