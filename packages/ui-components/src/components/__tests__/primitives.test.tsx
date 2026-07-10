import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  ConfirmDialog,
  DateInput,
  DateTimeInput,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  IconButton,
  Menu,
  MultiSelect,
  NumberInput,
  PageHeader,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SegmentedControl,
  SideNav,
  Skeleton,
  Switch,
  Tabs,
  TextInput,
  Tooltip,
  ToolbarButton,
  ButtonGroup,
  ValidationMessage
} from "../../index";

describe("@dravyn/ui-components primitives", () => {
  it("disables Button while loading and marks it busy", () => {
    const markup = renderToStaticMarkup(
      <Button loading onClick={() => undefined} variant="primary">
        Save
      </Button>
    );

    expect(markup).toContain("disabled=\"\"");
    expect(markup).toContain("aria-busy=\"true\"");
    expect(markup).toContain("dv-button__spinner");
  });

  it("requires IconButton aria-label through props and renders it", () => {
    const markup = renderToStaticMarkup(
      <IconButton aria-label="Refresh" title="Refresh">
        R
      </IconButton>
    );

    expect(markup).toContain("aria-label=\"Refresh\"");
  });

  it("renders first-party Icon title when not decorative", () => {
    const markup = renderToStaticMarkup(
      <Icon decorative={false} name="Search" title="Search icon" />
    );

    expect(markup).toContain("role=\"img\"");
    expect(markup).toContain("Search icon");
  });

  it("disables IconButton while loading", () => {
    const markup = renderToStaticMarkup(
      <IconButton aria-label="Refresh" loading>
        <Icon name="Refresh" />
      </IconButton>
    );

    expect(markup).toContain("disabled=\"\"");
    expect(markup).toContain("aria-busy=\"true\"");
  });

  it("renders ToolbarButton active state", () => {
    const markup = renderToStaticMarkup(
      <ToolbarButton active icon={<Icon name="Filter" />} label="Filters" />
    );

    expect(markup).toContain("dv-toolbar-button--active");
    expect(markup).toContain("aria-pressed=\"true\"");
  });

  it("renders SegmentedControl selected option", () => {
    const markup = renderToStaticMarkup(
      <SegmentedControl
        aria-label="Density"
        value="compact"
        onChange={() => undefined}
        options={[
          { value: "compact", label: "Compact" },
          { value: "standard", label: "Standard" }
        ]}
      />
    );

    expect(markup).toContain("role=\"radiogroup\"");
    expect(markup).toContain("aria-checked=\"true\"");
  });

  it("renders ButtonGroup orientation and size", () => {
    const markup = renderToStaticMarkup(
      <ButtonGroup orientation="vertical" size="sm">
        <Button>One</Button>
      </ButtonGroup>
    );

    expect(markup).toContain("aria-orientation=\"vertical\"");
    expect(markup).toContain("dv-button-group--sm");
  });

  it("passes native onChange handlers through form controls", () => {
    const onInputChange = vi.fn();
    const onCheckboxChange = vi.fn();
    const onSelectChange = vi.fn();
    const onNumberChange = vi.fn();
    const onDateChange = vi.fn();
    const onDateTimeChange = vi.fn();
    const input = <TextInput onChange={onInputChange} />;
    const checkbox = <Checkbox onChange={onCheckboxChange} />;
    const select = <Select onChange={onSelectChange} />;
    const number = <NumberInput onChange={onNumberChange} />;
    const date = <DateInput onChange={onDateChange} />;
    const dateTime = <DateTimeInput onChange={onDateTimeChange} />;

    expect(input.props.onChange).toBe(onInputChange);
    expect(checkbox.props.onChange).toBe(onCheckboxChange);
    expect(select.props.onChange).toBe(onSelectChange);
    expect(number.props.onChange).toBe(onNumberChange);
    expect(date.props.onChange).toBe(onDateChange);
    expect(dateTime.props.onChange).toBe(onDateTimeChange);
  });

  it("renders Badge variant classes", () => {
    const markup = renderToStaticMarkup(<Badge variant="success">Active</Badge>);

    expect(markup).toContain("dv-badge--success");
  });

  it("renders Field label, description, and error state", () => {
    const markup = renderToStaticMarkup(
      <Field
        description="Helper text"
        error="Required"
        htmlFor="name"
        label="Name"
        required
      >
        <TextInput id="name" invalid />
      </Field>
    );

    expect(markup).toContain("<label");
    expect(markup).toContain("Helper text");
    expect(markup).toContain("Required");
    expect(markup).toContain("role=\"alert\"");
  });

  it("renders Field warning and horizontal orientation", () => {
    const markup = renderToStaticMarkup(
      <Field label="Limit" orientation="horizontal" warning="Close to limit">
        <NumberInput defaultValue={80} />
      </Field>
    );

    expect(markup).toContain("dv-field--horizontal");
    expect(markup).toContain("dv-field--warning");
    expect(markup).toContain("Close to limit");
  });

  it("renders Radio checked and invalid state", () => {
    const onChange = vi.fn();
    const radio = <Radio checked invalid label="Email" onChange={onChange} value="email" />;
    const markup = renderToStaticMarkup(radio);

    expect(radio.props.onChange).toBe(onChange);
    expect(markup).toContain("type=\"radio\"");
    expect(markup).toContain("checked=\"\"");
    expect(markup).toContain("aria-invalid=\"true\"");
  });

  it("renders RadioGroup controlled selection and error", () => {
    const markup = renderToStaticMarkup(
      <RadioGroup
        error="Choose one"
        label="Delivery"
        name="delivery"
        options={[
          { value: "standard", label: "Standard" },
          { value: "express", label: "Express", disabled: true }
        ]}
        value="standard"
      />
    );

    expect(markup).toContain("<fieldset");
    expect(markup).toContain("<legend");
    expect(markup).toContain("checked=\"\"");
    expect(markup).toContain("Choose one");
    expect(markup).toContain("disabled=\"\"");
  });

  it("renders Switch checked state and accessible role", () => {
    const markup = renderToStaticMarkup(
      <Switch checked label="Enabled" onCheckedChange={() => undefined} />
    );

    expect(markup).toContain("role=\"switch\"");
    expect(markup).toContain("aria-checked=\"true\"");
    expect(markup).toContain("Enabled");
  });

  it("renders native number and date inputs", () => {
    const markup = renderToStaticMarkup(
      <>
        <NumberInput defaultValue={10} min={0} max={20} />
        <NumberInput defaultValue={12.5} mode="decimal" />
        <DateInput defaultValue="2026-07-10" />
        <DateTimeInput defaultValue="2026-07-10T09:30" />
      </>
    );

    expect(markup).toContain("type=\"number\"");
    expect(markup).toContain("inputMode=\"decimal\"");
    expect(markup).toContain("step=\"any\"");
    expect(markup).toContain("type=\"date\"");
    expect(markup).toContain("type=\"datetime-local\"");
  });

  it("renders MultiSelect selected chips and disabled options", () => {
    const markup = renderToStaticMarkup(
      <MultiSelect
        value={["admin"]}
        options={[
          { value: "admin", label: "Admin" },
          { value: "viewer", label: "Viewer", disabled: true }
        ]}
      />
    );

    expect(markup).toContain("dv-multi-select__chip");
    expect(markup).toContain("Admin");
    expect(markup).toContain("aria-expanded=\"false\"");
  });

  it("renders ValidationMessage tone", () => {
    const markup = renderToStaticMarkup(
      <ValidationMessage tone="info">Helpful message</ValidationMessage>
    );

    expect(markup).toContain("dv-validation-message--info");
    expect(markup).toContain("Helpful message");
  });

  it("renders static Skeleton class when animated is false", () => {
    const markup = renderToStaticMarkup(<Skeleton animated={false} />);

    expect(markup).toContain("dv-skeleton--static");
  });

  it("renders EmptyState and ErrorState actions", () => {
    const emptyMarkup = renderToStaticMarkup(
      <EmptyState actions={<Button>New</Button>} title="No records" />
    );
    const errorMarkup = renderToStaticMarkup(
      <ErrorState retryAction={<Button>Retry</Button>} title="Failed" />
    );

    expect(emptyMarkup).toContain("New");
    expect(errorMarkup).toContain("Retry");
  });

  it("renders Popover content when uncontrolled defaultOpen is true", () => {
    const markup = renderToStaticMarkup(
      <Popover defaultOpen trigger={<Button>Open</Button>}>
        Popover content
      </Popover>
    );

    expect(markup).toContain("Popover content");
    expect(markup).toContain("dv-popover__content");
  });

  it("renders Menu items and disabled state", () => {
    const markup = renderToStaticMarkup(
      <Menu
        defaultOpen
        trigger={<Button>Menu</Button>}
        items={[
          { id: "edit", label: "Edit" },
          { id: "delete", label: "Delete", danger: true, disabled: true }
        ]}
      />
    );

    expect(markup).toContain("Edit");
    expect(markup).toContain("Delete");
    expect(markup).toContain("disabled=\"\"");
  });

  it("renders Dialog markup when open", () => {
    const markup = renderToStaticMarkup(
      <Dialog
        description="Dialog description"
        onOpenChange={() => undefined}
        open
        title="Dialog title"
      >
        Dialog body
      </Dialog>
    );

    expect(markup).toContain("role=\"dialog\"");
    expect(markup).toContain("aria-modal=\"true\"");
    expect(markup).toContain("Dialog body");
  });

  it("renders ConfirmDialog actions", () => {
    const markup = renderToStaticMarkup(
      <ConfirmDialog
        onConfirm={() => undefined}
        onOpenChange={() => undefined}
        open
        title="Confirm action"
        variant="danger"
      />
    );

    expect(markup).toContain("Confirm action");
    expect(markup).toContain("dv-button--danger");
  });

  it("does not render Tooltip content before interaction", () => {
    const markup = renderToStaticMarkup(
      <Tooltip content="Helpful hint">
        <button type="button">Focus me</button>
      </Tooltip>
    );

    expect(markup).not.toContain("Helpful hint");
  });

  it("renders AppShell header, sidebar, and content regions", () => {
    const markup = renderToStaticMarkup(
      <AppShell header="Header" sidebar="Sidebar">
        Content
      </AppShell>
    );

    expect(markup).toContain("dv-app-shell--with-sidebar");
    expect(markup).toContain("dv-app-shell__header");
    expect(markup).toContain("Sidebar");
    expect(markup).toContain("Content");
  });

  it("renders PageHeader actions and status", () => {
    const markup = renderToStaticMarkup(
      <PageHeader
        actions={<Button>Approve</Button>}
        status={<Badge variant="success">Active</Badge>}
        title="Customer"
      />
    );

    expect(markup).toContain("Customer");
    expect(markup).toContain("Approve");
    expect(markup).toContain("dv-page-header__status");
  });

  it("marks the current Breadcrumb item", () => {
    const markup = renderToStaticMarkup(
      <Breadcrumbs
        items={[
          { id: "home", label: "Home", href: "/" },
          { id: "orders", label: "Orders", current: true }
        ]}
      />
    );

    expect(markup).toContain("aria-current=\"page\"");
    expect(markup).toContain("Orders");
  });

  it("renders SideNav active state and calls onSelect", () => {
    const onSelect = vi.fn();
    const element = SideNav({
      activeId: "orders",
      items: [
        { id: "overview", label: "Overview" },
        { id: "orders", label: "Orders" }
      ],
      onSelect
    });
    const markup = renderToStaticMarkup(element);
    const list = Array.isArray(element.props.children)
      ? element.props.children[1]
      : undefined;
    const entries = list?.props.children;
    const activeEntry = Array.isArray(entries) ? entries[1] : undefined;
    const activeButton = Array.isArray(activeEntry?.props.children)
      ? activeEntry.props.children[0]
      : undefined;

    activeButton?.props.onClick();

    expect(markup).toContain("dv-side-nav__item--active");
    expect(markup).toContain("aria-current=\"page\"");
    expect(onSelect).toHaveBeenCalledWith({ id: "orders", label: "Orders" });
  });

  it("renders controlled Tabs selection and disabled tabs", () => {
    const markup = renderToStaticMarkup(
      <Tabs
        value="details"
        items={[
          { id: "summary", label: "Summary", content: "Summary panel" },
          { id: "details", label: "Details", content: "Details panel" },
          { id: "history", label: "History", disabled: true }
        ]}
      />
    );

    expect(markup).toContain("role=\"tablist\"");
    expect(markup).toContain("aria-selected=\"true\"");
    expect(markup).toContain("Details panel");
    expect(markup).toContain("disabled=\"\"");
  });
});
