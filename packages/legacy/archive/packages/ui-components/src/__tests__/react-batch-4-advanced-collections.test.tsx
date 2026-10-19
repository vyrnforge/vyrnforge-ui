import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Autocomplete, MultiSelect, TransferList } from "../index";
import { createUser, render, screen } from "../../../../tests/dom";

describe("MFD-1412 React advanced collection parity", () => {
  it("preserves Autocomplete filtering, keyboard selection, and hidden form submission", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { container } = render(
      <Autocomplete
        ariaLabel="Environment"
        name="environment"
        onInputValueChange={onInputValueChange}
        onValueChange={onValueChange}
        options={[
          { value: "prod", label: "Production" },
          { value: "stage", label: "Staging" },
        ]}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Environment" });
    fireEvent.change(input, { target: { value: "stag" } });
    expect(onInputValueChange).toHaveBeenLastCalledWith("stag");
    expect(
      await screen.findByRole("option", { name: "Staging" }),
    ).toBeVisible();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onValueChange).toHaveBeenLastCalledWith(
      "stage",
      expect.objectContaining({ value: "stage" }),
    );
    expect(container.querySelector('input[name="environment"]')).toHaveValue(
      "stage",
    );
    expect(container.querySelector("vf-autocomplete")).toBeNull();
  });

  it("preserves MultiSelect rich labels, searchable filtering, and roving option focus", async () => {
    const user = createUser();
    const onValueChange = vi.fn();
    const { container } = render(
      <MultiSelect
        aria-label="Regions"
        onValueChange={onValueChange}
        options={[
          { value: "us", label: <strong>United States</strong> },
          { value: "eu", label: "Europe" },
        ]}
        searchable
      />,
    );

    const trigger = screen.getByRole("button", { name: "Regions" });
    await user.click(trigger);
    expect(screen.getByText("United States").tagName).toBe("STRONG");

    const search = screen.getByRole("searchbox", { name: "Search options" });
    await user.type(search, "eur");
    const option = screen.getByRole("option", { name: "Europe" });
    expect(option).toBeVisible();

    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() => expect(option).toHaveFocus());
    await user.click(option);

    expect(onValueChange).toHaveBeenLastCalledWith(["eu"]);
    expect(container.querySelector("vf-multi-select")).toBeNull();
  });

  it("preserves TransferList custom option composition, selection, movement, and repeated form values", async () => {
    const user = createUser();
    const onValueChange = vi.fn();
    const { container } = render(
      <TransferList
        ariaLabel="Team assignment"
        name="member"
        onValueChange={onValueChange}
        options={[
          { value: "ada", label: "Ada" },
          { value: "grace", label: "Grace" },
        ]}
        renderOption={(option) => <strong>{option.label}</strong>}
        searchable
      />,
    );

    expect(
      screen.getByRole("group", { name: "Team assignment" }),
    ).toBeVisible();
    await user.click(screen.getByText("Ada"));
    await user.click(
      screen.getByRole("button", {
        name: /Move selected items to Assigned/i,
      }),
    );

    expect(onValueChange).toHaveBeenLastCalledWith(
      ["ada"],
      [expect.objectContaining({ value: "ada" })],
    );
    expect(container.querySelectorAll('input[name="member"]')).toHaveLength(1);
    expect(container.querySelector('input[name="member"]')).toHaveValue("ada");
    expect(container.querySelector("vf-transfer-list")).toBeNull();
  });
});
