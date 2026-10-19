import { fireEvent, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../../tests/dom";
import {
  Checkbox,
  DateInput,
  DateTimeInput,
  NumberInput,
  Radio,
  SearchInput,
  Slider,
  Switch,
  Textarea,
  TextInput,
} from "../index";

describe("MFD-1410 React simple form facade migration", () => {
  it("preserves SSR native controls inside canonical hosts", () => {
    const textMarkup = renderToStaticMarkup(
      <TextInput className="consumer-input" defaultValue="alpha" required />,
    );
    const textareaMarkup = renderToStaticMarkup(
      <Textarea defaultValue="notes" rows={4} />,
    );
    const dateMarkup = renderToStaticMarkup(
      <DateInput defaultValue="2026-08-24" min="2026-01-01" />,
    );
    const searchMarkup = renderToStaticMarkup(
      <SearchInput aria-label="Search" defaultValue="query" />,
    );

    expect(textMarkup).toContain("<vf-text-input");
    expect(textMarkup).toContain("<input");
    expect(textMarkup).toContain('data-vf-input-control=""');
    expect(textMarkup).toContain("consumer-input");
    expect(textareaMarkup).toContain("<vf-textarea");
    expect(textareaMarkup).toContain("<textarea");
    expect(textareaMarkup).toContain('rows="4"');
    expect(dateMarkup).toContain("<vf-date-input");
    expect(dateMarkup).toContain('type="date"');
    expect(searchMarkup).toContain("<vf-search-input");
    expect(searchMarkup).toContain('type="search"');
  });

  it("keeps TextInput native refs, events, consumer classes, and uncontrolled state", async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { rerender } = render(
      <TextInput
        className="consumer-input"
        data-testid="text-input"
        defaultValue="alpha"
        onChange={onChange}
        ref={ref}
      />,
    );

    const control = screen.getByTestId("text-input") as HTMLInputElement;
    expect(ref.current).toBe(control);
    expect(control.tagName).toBe("INPUT");
    expect(control.closest("vf-text-input")).not.toBeNull();

    fireEvent.change(control, { target: { value: "beta" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(control.value).toBe("beta");

    rerender(
      <TextInput
        className="consumer-updated"
        data-testid="text-input"
        defaultValue="alpha"
        invalid
        onChange={onChange}
        ref={ref}
      />,
    );

    await waitFor(() => {
      expect(control.value).toBe("beta");
      expect(control).toHaveClass("consumer-updated");
      expect(control).not.toHaveClass("consumer-input");
    });
  });

  it("keeps Textarea native refs, rows, events, and uncontrolled state", async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const onChange = vi.fn();
    const { rerender } = render(
      <Textarea
        className="consumer-textarea"
        data-testid="textarea"
        defaultValue="notes"
        onChange={onChange}
        ref={ref}
        rows={4}
      />,
    );

    const control = screen.getByTestId("textarea") as HTMLTextAreaElement;
    expect(ref.current).toBe(control);
    expect(control.closest("vf-textarea")).not.toBeNull();
    expect(control.rows).toBe(4);

    fireEvent.change(control, { target: { value: "updated notes" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(control.value).toBe("updated notes");

    rerender(
      <Textarea
        className="consumer-textarea"
        data-testid="textarea"
        defaultValue="notes"
        invalid
        onChange={onChange}
        ref={ref}
        rows={4}
      />,
    );

    await waitFor(() => expect(control.value).toBe("updated notes"));
  });

  it("keeps controlled TextInput canonical state aligned with the React value", () => {
    const onChange = vi.fn();
    render(
      <TextInput
        data-testid="controlled-text"
        onChange={onChange}
        value="locked"
      />,
    );

    const control = screen.getByTestId("controlled-text") as HTMLInputElement;
    const host = control.closest("vf-text-input") as unknown as {
      value: string;
    };

    fireEvent.change(control, { target: { value: "attempt" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(host.value).toBe("locked");
  });

  it("preserves date and datetime constraints on the native controls", async () => {
    const dateRef = createRef<HTMLInputElement>();
    render(
      <>
        <DateInput
          data-testid="date"
          defaultValue="2026-08-24"
          max="2026-12-31"
          min="2026-01-01"
          ref={dateRef}
        />
        <DateTimeInput
          data-testid="datetime"
          defaultValue="2026-08-24T10:30"
          min="2026-08-01T00:00"
          step={60}
        />
      </>,
    );

    const date = screen.getByTestId("date") as HTMLInputElement;
    const dateTime = screen.getByTestId("datetime") as HTMLInputElement;

    await waitFor(() => {
      expect(dateRef.current).toBe(date);
      expect(date.value).toBe("2026-08-24");
      expect(date.min).toBe("2026-01-01");
      expect(date.max).toBe("2026-12-31");
      expect(date).toHaveClass("vf-date-input");
      expect(dateTime.value).toBe("2026-08-24T10:30");
      expect(dateTime.min).toBe("2026-08-01T00:00");
      expect(dateTime.step).toBe("60");
      expect(dateTime).toHaveClass("vf-datetime-input");
    });
  });

  it("keeps NumberInput filtering plus decimal step and inputMode contracts", async () => {
    const onChange = vi.fn();
    render(
      <NumberInput
        data-testid="number"
        defaultValue="1.5"
        mode="decimal"
        onChange={onChange}
      />,
    );

    const control = screen.getByTestId("number") as HTMLInputElement;

    await waitFor(() => {
      expect(control.step).toBe("any");
      expect(control.inputMode).toBe("decimal");
      expect(control).toHaveClass("vf-number-input");
    });

    fireEvent.change(control, { target: { value: "2.5" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("preserves checkbox label structure and uncontrolled checked state", async () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(
      <Checkbox
        data-testid="checkbox"
        defaultChecked
        label="Remember"
        ref={ref}
      />,
    );

    const control = screen.getByTestId("checkbox") as HTMLInputElement;
    expect(ref.current).toBe(control);
    expect(control.checked).toBe(true);
    expect(screen.getByText("Remember")).toBeInTheDocument();
    expect(control.closest("vf-checkbox")).not.toBeNull();

    fireEvent.click(control);
    expect(control.checked).toBe(false);

    rerender(
      <Checkbox
        data-testid="checkbox"
        defaultChecked
        invalid
        label="Remember"
        ref={ref}
      />,
    );

    await waitFor(() => expect(control.checked).toBe(false));
  });

  it("keeps Radio ReactNode label and description outside canonical ownership", async () => {
    render(
      <Radio
        data-testid="radio"
        description={<strong>Additional context</strong>}
        label={<em>Choice A</em>}
        value="a"
      />,
    );

    const control = screen.getByTestId("radio");
    expect(control.closest("vf-radio")).not.toBeNull();

    await waitFor(() => {
      expect(screen.getByText("Choice A")).toBeInTheDocument();
      expect(screen.getByText("Additional context")).toBeInTheDocument();
    });
  });

  it("keeps Switch native change callbacks and React-owned content", () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Switch
        data-testid="switch"
        description="Details"
        label="Notifications"
        onChange={onChange}
        onCheckedChange={onCheckedChange}
      />,
    );

    const control = screen.getByTestId("switch") as HTMLInputElement;
    expect(control.closest("vf-switch")).not.toBeNull();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();

    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("keeps Slider React value callbacks and visible composition canonical-backed", async () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        data-testid="slider"
        defaultValue={25}
        label="Volume"
        onValueChange={onValueChange}
        showValue
      />,
    );

    const control = screen.getByTestId("slider") as HTMLInputElement;
    expect(control.closest("vf-slider")).not.toBeNull();
    expect(screen.getByText("Volume")).toBeInTheDocument();

    fireEvent.change(control, { target: { value: "40" } });

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith(40);
      expect(control.value).toBe("40");
      expect(screen.getByText("40")).toBeInTheDocument();
    });
  });
});
