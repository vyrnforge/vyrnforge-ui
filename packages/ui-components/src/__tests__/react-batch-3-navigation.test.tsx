import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { Select, ToggleButton, ToggleButtonGroup, TopNav } from "../index";
import { createUser, render, screen } from "../../../../tests/dom";

describe("MFD-1411 React navigation and selection canonical facades", () => {
  it("backs standalone ToggleButton with the canonical toggle action and preserves the native ref", async () => {
    const user = createUser();
    const onPressedChange = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(
      <ToggleButton onPressedChange={onPressedChange} ref={ref}>
        Archived
      </ToggleButton>,
    );

    const button = screen.getByRole("button", { name: "Archived" });
    expect(container.querySelector("vf-toggle-button")).not.toBeNull();
    expect(ref.current).toBe(button);

    await user.click(button);

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("vf-toggle-button--pressed");
  });

  it("keeps ToggleButtonGroup selection and roving focus compatible through canonical hosts", async () => {
    const user = createUser();
    const onValueChange = vi.fn();
    const { container } = render(
      <ToggleButtonGroup
        ariaLabel="Formatting"
        defaultValue={["bold"]}
        onValueChange={onValueChange}
        type="multiple"
      >
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
      </ToggleButtonGroup>,
    );

    expect(container.querySelector("vf-toggle-button-group")).not.toBeNull();
    expect(container.querySelectorAll("vf-toggle-button")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);

    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    bold.focus();
    fireEvent.keyDown(screen.getByRole("group", { name: "Formatting" }), {
      key: "ArrowRight",
    });
    expect(italic).toHaveFocus();
  });

  it("backs single Select with vf-select while preserving the native control contract", () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLSelectElement>();
    const { container } = render(
      <Select
        aria-label="Environment"
        onChange={onChange}
        options={[
          { value: "prod", label: "Production" },
          { value: "stage", label: "Staging" },
        ]}
        ref={ref}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Environment" });
    expect(container.querySelector("vf-select")).not.toBeNull();
    expect(ref.current).toBe(select);
    expect(select).toHaveValue("prod");

    fireEvent.change(select, { target: { value: "stage" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue("stage");
  });

  it("keeps native multiple Select on the documented compatibility path", () => {
    const { container } = render(
      <Select
        aria-label="Regions"
        defaultValue={["us", "eu"]}
        multiple
        options={[
          { value: "us", label: "United States" },
          { value: "eu", label: "Europe" },
        ]}
      />,
    );

    expect(container.querySelector("vf-select")).toBeNull();
    expect(screen.getByRole("listbox", { name: "Regions" })).toHaveAttribute(
      "multiple",
    );
  });

  it("renders TopNav through vf-top-nav without surrendering React composition regions", () => {
    const markup = renderToStaticMarkup(
      <TopNav
        actions={<button type="button">Create</button>}
        brand={<strong>VyrnForge</strong>}
        navigation={<a href="/docs">Docs</a>}
        userArea={<span>Account</span>}
      />,
    );

    expect(markup).toContain("<vf-top-nav");
    expect(markup).toContain('role="banner"');
    expect(markup).toContain("vf-top-nav__brand");
    expect(markup).toContain("vf-top-nav__navigation");
    expect(markup).toContain("vf-top-nav__actions");
    expect(markup).toContain("VyrnForge");
    expect(markup).toContain("Account");
  });
});
