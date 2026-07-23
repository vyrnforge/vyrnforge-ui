import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import {
  Button,
  Checkbox,
  RadioGroup,
  Rating,
  SegmentedControl,
  Slider,
  Switch,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
} from "../../index";
import { createUser, render, screen } from "../../../../../tests/dom";

describe("React adapters preserve shared behavior parity", () => {
  it("resolves Button loading through the shared action state", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("toggles standalone and grouped toggle buttons", async () => {
    const user = createUser();
    const onPressedChange = vi.fn();
    const onValueChange = vi.fn();

    render(
      <>
        <ToggleButton onPressedChange={onPressedChange}>Archived</ToggleButton>
        <ToggleButtonGroup
          ariaLabel="Formatting"
          defaultValue={["bold"]}
          onValueChange={onValueChange}
          type="multiple"
        >
          <ToggleButton value="bold">Bold</ToggleButton>
          <ToggleButton value="italic">Italic</ToggleButton>
        </ToggleButtonGroup>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Archived" }));
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Archived" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
  });

  it("keeps SegmentedControl controlled and rejects disabled options", async () => {
    const user = createUser();
    const onChange = vi.fn();

    render(
      <SegmentedControl
        aria-label="Density"
        onChange={onChange}
        options={[
          { value: "compact", label: "Compact" },
          { value: "standard", label: "Standard", disabled: true },
        ]}
        value="compact"
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Standard" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Compact" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("preserves native Checkbox and Switch input behavior", async () => {
    const user = createUser();
    const onCheckedChange = vi.fn();

    render(
      <>
        <Checkbox defaultChecked label="Enabled" />
        <Switch label="Notifications" onCheckedChange={onCheckedChange} />
      </>,
    );

    expect(screen.getByRole("checkbox", { name: "Enabled" })).toBeChecked();
    await user.click(screen.getByRole("switch", { name: "Notifications" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("adapts choice and numeric behavior for form controls", async () => {
    const user = createUser();
    const onRadioChange = vi.fn();
    const onSliderChange = vi.fn();
    const onRatingChange = vi.fn();

    render(
      <>
        <RadioGroup
          label="Delivery"
          onValueChange={onRadioChange}
          options={[
            { value: "standard", label: "Standard" },
            { value: "express", label: "Express" },
          ]}
        />
        <Slider
          ariaLabel="Allocation"
          defaultValue={10}
          max={20}
          onValueChange={onSliderChange}
        />
        <Rating allowClear defaultValue={2} onValueChange={onRatingChange} />
      </>,
    );

    await user.click(screen.getByRole("radio", { name: "Express" }));
    expect(onRadioChange).toHaveBeenCalledWith("express");

    const slider = screen.getByRole("slider", { name: "Allocation" });

    fireEvent.change(slider, {
      target: { value: "11" },
    });

    expect(onSliderChange).toHaveBeenCalledWith(11);
    expect((slider as HTMLInputElement).value).toBe("11");

    const secondStar = screen.getByRole("radio", { name: "2 of 5 stars" });
    await user.click(secondStar);
    expect(onRatingChange).toHaveBeenCalledWith(0);
  });

  it("keeps controlled Tabs synchronized through the shared tabs controller", async () => {
    const user = createUser();
    const onValueChange = vi.fn();

    function Harness() {
      const [value, setValue] = useState("summary");
      return (
        <Tabs
          items={[
            { id: "summary", label: "Summary", content: "Summary panel" },
            { id: "billing", label: "Billing", disabled: true },
            { id: "activity", label: "Activity", content: "Activity panel" },
          ]}
          onValueChange={(nextValue) => {
            onValueChange(nextValue);
            setValue(nextValue);
          }}
          value={value}
        />
      );
    }

    render(<Harness />);
    const summary = screen.getByRole("tab", { name: "Summary" });
    summary.focus();
    await user.keyboard("{End}");

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("activity");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
  });
});
