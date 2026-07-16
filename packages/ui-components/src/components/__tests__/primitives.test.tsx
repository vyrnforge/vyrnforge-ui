import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AppShell,
  Autocomplete,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  ConfirmDialog,
  DateInput,
  DateTimeInput,
  Dialog,
  Drawer,
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
  Rating,
  Select,
  SegmentedControl,
  SideNav,
  Skeleton,
  Slider,
  Switch,
  Tabs,
  TextInput,
  Tooltip,
  ToolbarButton,
  Toast,
  ToastAction,
  ToastViewport,
  ToggleButton,
  ToggleButtonGroup,
  TransferList,
  useToast,
  ButtonGroup,
  ValidationMessage
} from "../../index";
import {
  defaultAutocompleteFilter,
  getFirstEnabledIndex,
  getLastEnabledIndex,
  getNextEnabledIndex
} from "../Autocomplete/useAutocomplete";
import {
  defaultTransferListFilter,
  enabledOptionValues,
  mergeTargetValues,
  normalizeTransferValues,
  removeTargetValues,
  selectedEnabledValues
} from "../TransferList/transferList.utils";
import {
  initialToastState,
  toastReducer
} from "../Toast/toast.reducer";
import {
  getToastDuration,
  getVisibleToasts
} from "../Toast/toast.utils";

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

  it("renders Rating controlled, read-only, disabled, and accessible radio labels", () => {
    const markup = renderToStaticMarkup(
      <>
        <Rating label="Quality" max={5} value={3} />
        <Rating label="Archived quality" readOnly value={4} />
        <Rating disabled label="Unavailable quality" defaultValue={2} />
      </>
    );

    expect(markup).toContain("type=\"radio\"");
    expect(markup).toContain("aria-label=\"3 of 5 stars\"");
    expect(markup).toContain("dv-rating--read-only");
    expect(markup).toContain("dv-rating--disabled");
  });

  it("renders Slider with native range constraints and displayed controlled value", () => {
    const markup = renderToStaticMarkup(
      <Slider ariaLabel="Allocation" max={50} min={0} showValue step={5} value={25} />
    );

    expect(markup).toContain("type=\"range\"");
    expect(markup).toContain("min=\"0\"");
    expect(markup).toContain("max=\"50\"");
    expect(markup).toContain("step=\"5\"");
    expect(markup).toContain(">25</output>");
  });

  it("renders ToggleButton pressed and disabled states", () => {
    const markup = renderToStaticMarkup(
      <>
        <ToggleButton pressed>Show archived</ToggleButton>
        <ToggleButton disabled>Managed</ToggleButton>
      </>
    );

    expect(markup).toContain("aria-pressed=\"true\"");
    expect(markup).toContain("dv-toggle-button--pressed");
    expect(markup).toContain("disabled=\"\"");
  });

  it("renders ToggleButtonGroup single and multiple default selections", () => {
    const markup = renderToStaticMarkup(
      <>
        <ToggleButtonGroup ariaLabel="View" defaultValue="table">
          <ToggleButton value="table">Table</ToggleButton>
          <ToggleButton value="board">Board</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup ariaLabel="Formatting" defaultValue={["bold", "italic"]} type="multiple">
          <ToggleButton value="bold">Bold</ToggleButton>
          <ToggleButton value="italic">Italic</ToggleButton>
        </ToggleButtonGroup>
      </>
    );

    expect(markup).toContain("dv-toggle-button-group--single");
    expect(markup).toContain("dv-toggle-button-group--multiple");
    expect(markup.match(/aria-pressed=\"true\"/g)).toHaveLength(3);
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
        id="name"
        label="Name"
        required
      >
        {(controlProps) => <TextInput {...controlProps} />}
      </Field>
    );

    expect(markup).toContain("for=\"name\"");
    expect(markup).toContain("id=\"name\"");
    expect(markup).toMatch(/aria-describedby=\"name-description [^\"]+-message\"/);
    expect(markup).toContain("aria-invalid=\"true\"");
    expect(markup).toContain("aria-required=\"true\"");
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

  it("forwards native Switch change handlers alongside onCheckedChange", () => {
    const onChange = vi.fn();
    const switchElement = <Switch label="Enabled" onChange={onChange} onCheckedChange={() => undefined} />;

    expect(switchElement.props.onChange).toBe(onChange);
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

  it("renders Autocomplete combobox, hidden form value, and listbox semantics", () => {
    const markup = renderToStaticMarkup(
      <Autocomplete
        defaultInputValue=""
        defaultOpen
        defaultValue="operator"
        invalid
        name="role"
        options={[
          { value: "admin", label: "Administrator" },
          { value: "operator", label: "Operator" },
          { value: "viewer", label: "Viewer", disabled: true }
        ]}
        required
      />
    );

    expect(markup).toContain("role=\"combobox\"");
    expect(markup).toContain("aria-autocomplete=\"list\"");
    expect(markup).toContain("aria-expanded=\"true\"");
    expect(markup).toContain("role=\"listbox\"");
    expect(markup).toContain("role=\"option\"");
    expect(markup).toContain("aria-selected=\"true\"");
    expect(markup).toContain("aria-disabled=\"true\"");
    expect(markup).toContain("name=\"role\"");
    expect(markup).toContain("value=\"operator\"");
    expect(markup).toContain("aria-invalid=\"true\"");
    expect(markup).toContain("aria-required=\"true\"");
  });

  it("filters Autocomplete options and skips disabled navigation targets", () => {
    const options = [
      { value: "admin", label: "Administrator", keywords: ["owner"] },
      { value: "operator", label: "Operator", disabled: true },
      { value: "viewer", label: "Viewer", keywords: ["read"] }
    ];

    expect(defaultAutocompleteFilter(options, "ADMIN")).toHaveLength(1);
    expect(defaultAutocompleteFilter(options, "read")[0]?.value).toBe("viewer");
    expect(getFirstEnabledIndex(options)).toBe(0);
    expect(getLastEnabledIndex(options)).toBe(2);
    expect(getNextEnabledIndex(options, 0, 1)).toBe(2);
    expect(getNextEnabledIndex(options, 2, -1)).toBe(0);
  });

  it("renders TransferList panels, checkbox labels, actions, and hidden target values", () => {
    const markup = renderToStaticMarkup(
      <TransferList
        defaultValue={["atlas", "missing", "atlas"]}
        name="applicationIds"
        options={[
          {
            value: "iam",
            label: "Identity and Access Management",
            description: "Authentication and roles."
          },
          {
            value: "atlas",
            label: "Atlas Intelligence Platform",
            description: "Document intelligence."
          },
          {
            value: "gateway",
            label: "Gateway UI",
            disabled: true
          }
        ]}
        required
        searchable
        sourceTitle="Available applications"
        targetTitle="Assigned applications"
      />
    );

    expect(markup).toContain("role=\"group\"");
    expect(markup).toContain("Available applications");
    expect(markup).toContain("Assigned applications");
    expect(markup).toContain("Identity and Access Management");
    expect(markup).toContain("Document intelligence.");
    expect(markup).toContain("aria-label=\"Move selected items to Assigned applications\"");
    expect(markup).toContain("aria-label=\"Move all items to Available applications\"");
    expect(markup).toContain("name=\"applicationIds\"");
    expect(markup).toContain("value=\"atlas\"");
    expect(markup).not.toContain("value=\"missing\"");
    expect(markup).toContain("aria-required=\"true\"");
  });

  it("does not submit TransferList hidden values while disabled", () => {
    const markup = renderToStaticMarkup(
      <TransferList
        defaultValue={["atlas"]}
        disabled
        name="applicationIds"
        options={[
          { value: "atlas", label: "Atlas Intelligence Platform" }
        ]}
      />
    );

    expect(markup).not.toContain("name=\"applicationIds\"");
    expect(markup).toContain("dv-transfer-list--disabled");
  });

  it("normalizes TransferList values and computes ordered move targets", () => {
    const options = [
      { value: "iam", label: "Identity" },
      { value: "atlas", label: "Atlas" },
      { value: "gateway", label: "Gateway", disabled: true },
      { value: "reports", label: "Reports", keywords: ["analytics"] }
    ];

    expect(normalizeTransferValues(["reports", "missing", "iam", "reports"], options)).toEqual(["iam", "reports"]);
    expect(mergeTargetValues(["atlas"], ["reports", "iam"], options)).toEqual(["iam", "atlas", "reports"]);
    expect(removeTargetValues(["iam", "atlas", "reports"], ["atlas"], options)).toEqual(["iam", "reports"]);
    expect(enabledOptionValues(options)).toEqual(["iam", "atlas", "reports"]);
    expect(selectedEnabledValues(["gateway", "reports"], options)).toEqual(["reports"]);
    expect(defaultTransferListFilter(options, "analytics", "source")[0]?.value).toBe("reports");
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

  it("renders Toast tone, accessible announcement, action, and dismiss control", () => {
    const markup = renderToStaticMarkup(
      <Toast
        action={<ToastAction altText="Retry export">Retry</ToastAction>}
        description="The report export failed."
        id="export-toast"
        onDismiss={() => undefined}
        title="Export failed"
        tone="error"
      />
    );

    expect(markup).toContain("dv-toast--error");
    expect(markup).toContain("role=\"alert\"");
    expect(markup).toContain("aria-live=\"assertive\"");
    expect(markup).toContain("Export failed");
    expect(markup).toContain("The report export failed.");
    expect(markup).toContain("aria-label=\"Retry export\"");
    expect(markup).toContain("aria-label=\"Dismiss notification\"");
  });

  it("renders ToastViewport position and toast items through the portal fallback", () => {
    const markup = renderToStaticMarkup(
      <ToastViewport
        onDismiss={() => undefined}
        position="top-center"
        toasts={[
          { id: "saved", title: "Saved", tone: "success" }
        ]}
      />
    );

    expect(markup).toContain("dv-toast-viewport--top-center");
    expect(markup).toContain("aria-label=\"Notifications\"");
    expect(markup).toContain("Saved");
  });

  it("updates duplicate Toast IDs, dismisses queued records, and orders visible toasts", () => {
    const firstState = toastReducer(initialToastState, {
      type: "add",
      toast: { id: "one", title: "One", tone: "neutral" }
    });
    const duplicateState = toastReducer(firstState, {
      type: "add",
      toast: { id: "one", title: "Updated", tone: "success" }
    });
    const queuedState = toastReducer(duplicateState, {
      type: "add",
      toast: { id: "two", title: "Two", tone: "info" }
    });
    const dismissedState = toastReducer(queuedState, {
      type: "dismiss",
      id: "one"
    });

    expect(duplicateState.toasts).toHaveLength(1);
    expect(duplicateState.toasts[0]?.title).toBe("Updated");
    expect(duplicateState.toasts[0]?.tone).toBe("success");
    expect(getVisibleToasts(queuedState.toasts, 1, false)[0]?.id).toBe("one");
    expect(getVisibleToasts(queuedState.toasts, 2, true).map((toast) => toast.id)).toEqual(["two", "one"]);
    expect(dismissedState.toasts.map((toast) => toast.id)).toEqual(["two"]);
  });

  it("keeps Toast duration defaults explicit and supports persistent duration", () => {
    expect(getToastDuration({}, 5000)).toBe(5000);
    expect(getToastDuration({ duration: null }, 5000)).toBeNull();
    expect(getToastDuration({ duration: 1200 }, 5000)).toBe(1200);
  });

  it("throws a clear Toast provider error when useToast is outside ToastProvider", () => {
    function MissingProvider() {
      useToast();
      return null;
    }

    expect(() => renderToStaticMarkup(<MissingProvider />)).toThrow(
      "useToast must be used within a ToastProvider."
    );
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
    expect(markup).toContain("dv-dialog__layer");
    expect(markup).toContain("data-dv-focus-fallback");
  });

  it("renders modal Drawer through the shared overlay layer", () => {
    const markup = renderToStaticMarkup(
      <Drawer onOpenChange={() => undefined} open side="top" title="Review">
        Drawer body
      </Drawer>
    );

    expect(markup).toContain("dv-drawer--top");
    expect(markup).toContain("aria-modal=\"true\"");
    expect(markup).toContain("dv-drawer__layer");
  });

  it("renders Popover portal-ready dismissal content", () => {
    const markup = renderToStaticMarkup(
      <Popover defaultOpen matchTriggerWidth trigger={<Button>Open</Button>}>
        Content
      </Popover>
    );

    expect(markup).toContain("dv-dismissable-layer");
    expect(markup).toContain("dv-popover__content");
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
    expect(markup).toContain("dv-app-shell__sidebar-scroll");
    expect(markup).toContain("Sidebar");
    expect(markup).toContain("Content");
  });

  it("renders AppShell scroll and position classes with layout variables", () => {
    const markup = renderToStaticMarkup(
      <AppShell
        collapsedSidebarWidth={72}
        header="Header"
        headerHeight={80}
        headerPosition="fixed"
        minHeight="720px"
        scrollMode="split"
        sidebar="Sidebar"
        sidebarCollapsed
        sidebarPosition="fixed"
        sidebarWidth={260}
      >
        Content
      </AppShell>
    );

    expect(markup).toContain("dv-app-shell--scroll-split");
    expect(markup).toContain("dv-app-shell--header-fixed");
    expect(markup).toContain("dv-app-shell--sidebar-fixed");
    expect(markup).toContain("dv-app-shell--sidebar-collapsed");
    expect(markup).toContain("--dv-app-shell-header-height:80px");
    expect(markup).toContain("--dv-app-shell-sidebar-width:260px");
    expect(markup).toContain("--dv-app-shell-sidebar-collapsed-width:72px");
    expect(markup).toContain("--dv-app-shell-min-height:720px");
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
    const scroll = Array.isArray(element.props.children)
      ? element.props.children[1]
      : undefined;
    const list = scroll?.props.children;
    const entries = list?.props.children;
    const activeEntry = Array.isArray(entries) ? entries[1] : undefined;
    const activeButton = Array.isArray(activeEntry?.props.children)
      ? activeEntry.props.children[0]
      : undefined;

    activeButton?.props.onClick();

    expect(markup).toContain("dv-side-nav__item--active");
    expect(markup).toContain("dv-side-nav__scroll");
    expect(markup).toContain("aria-current=\"page\"");
    expect(onSelect).toHaveBeenCalledWith({ id: "orders", label: "Orders" });
  });

  it("renders SideNav header, footer, scroll container, and collapsed state", () => {
    const markup = renderToStaticMarkup(
      <SideNav
        collapsed
        footer="Workspace"
        header="Dravyn"
        items={[{ id: "overview", label: "Overview" }]}
      />
    );

    expect(markup).toContain("dv-side-nav--collapsed");
    expect(markup).toContain("dv-side-nav__header");
    expect(markup).toContain("dv-side-nav__scroll");
    expect(markup).toContain("dv-side-nav__list");
    expect(markup).toContain("dv-side-nav__footer");
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
