import { ComponentDemoPage } from "../../components/ComponentDemoPage";
import { createLiveScope, LiveExample } from "../../components/live";

function live(
  id: string,
  title: string,
  initialCode: string,
  scope: Record<string, unknown>,
  imports: string,
  description?: string
) {
  return <LiveExample description={description} id={id} imports={imports} initialCode={initialCode.trim()} scope={scope} title={title} />;
}

const roleOptions = `[
  { value: "admin", label: "Administrator", description: "Manages workspace configuration", keywords: ["owner", "manager"] },
  { value: "operator", label: "Operator", description: "Runs day-to-day workflows", keywords: ["operations"] },
  { value: "viewer", label: "Viewer", description: "Read-only access", keywords: ["read"] }
]`;

export function AutocompletePage() {
  const basicScope = createLiveScope("Autocomplete");
  const stateScope = createLiveScope("Autocomplete", "Badge", "Caption", "Field", "Stack", "Text", "ValidationMessage");

  return <ComponentDemoPage
    accessibility={[
      "Autocomplete keeps focus on the text input while options are navigated through aria-activedescendant.",
      "Arrow keys skip disabled options; Enter selects the active option; Escape closes the list without clearing the selection.",
      "Field render-function composition supplies the generated id, description relationship, required state, and invalid state."
    ]}
    avoidWhen={[
      "The option set is small, stable, and easy to scan; use Select.",
      "The value is unconstrained user text; use TextInput.",
      "The goal is filtering a page or dataset rather than selecting one option; use SearchInput."
    ]}
    description="An experimental single-select searchable combobox for larger known option sets. It uses the shared portal, dismissal, and anchored positioning foundation without fetching data itself."
    importCode={'import { Autocomplete } from "@dravyn/ui-components";'}
    packageName="@dravyn/ui-components"
    props={[
      { name: "options", type: "readonly AutocompleteOptionData[]", required: true, description: "Serializable values, labels, optional descriptions, disabled state, and keywords." },
      { name: "value | defaultValue", type: "string | null", defaultValue: "null", description: "Controlled or initial selected value." },
      { name: "inputValue | defaultInputValue", type: "string", description: "Independent controlled or initial search text." },
      { name: "open | defaultOpen", type: "boolean", defaultValue: "false", description: "Independent controlled or initial listbox visibility." },
      { name: "onValueChange", type: "(value, option) => void", description: "Selection callback with selected option data." },
      { name: "filterOptions | renderOption", type: "function", description: "Application-owned filtering and option visual rendering." },
      { name: "loading | loadingText | noOptionsText", type: "boolean | ReactNode", description: "Application-provided async-compatible status state." },
      { name: "clearable | openOnFocus | autoHighlight", type: "boolean", description: "Interaction defaults: true, false, and true." }
    ]}
    relatedComponents={[
      { id: "select", name: "Select", description: "Small, stable option lists with native select behavior." },
      { id: "text-input", name: "TextInput", description: "Unconstrained text entry." },
      { id: "autocomplete", name: "SearchInput", description: "Filtering an existing page or dataset, not selecting a value." },
      { id: "popover", name: "Popover", description: "Underlying shared anchored-content foundation." }
    ]}
    sections={[
      { id: "basic-usage", label: "Basic usage", title: "Basic usage", children: live("autocomplete-basic", "Searchable role", `<Autocomplete
  options={${roleOptions}}
  placeholder="Select a role"
/>`, basicScope, 'import { Autocomplete } from "@dravyn/ui-components";') },
      { id: "controlled-value", label: "Controlled value", title: "Controlled value", children: live("autocomplete-controlled-value", "Application-owned selection", `function Example() {
  const [value, setValue] = React.useState("operator");
  return <Stack gap="sm"><Autocomplete options={${roleOptions}} onValueChange={(nextValue) => setValue(nextValue)} value={value} /><Text tone="muted">Selected value: {value || "None"}</Text></Stack>;
}

render(<Example />);`, stateScope, 'import { Autocomplete, Stack, Text } from "@dravyn/ui-components";') },
      { id: "controlled-input", label: "Controlled input", title: "Controlled input", children: live("autocomplete-controlled-input", "Application-owned query", `function Example() {
  const [query, setQuery] = React.useState("");
  return <Stack gap="sm"><Autocomplete inputValue={query} onInputValueChange={setQuery} options={${roleOptions}} placeholder="Type a role" /><Text tone="muted">Query: {query || "Empty"}</Text></Stack>;
}

render(<Example />);`, stateScope, 'import { Autocomplete, Stack, Text } from "@dravyn/ui-components";') },
      { id: "custom-options", label: "Custom options", title: "Custom options", children: live("autocomplete-custom-options", "Keywords and descriptions", `<Autocomplete
  openOnFocus
  options={${roleOptions}}
  placeholder="Find a workspace role"
/>`, basicScope, 'import { Autocomplete } from "@dravyn/ui-components";', "Search matches labels and optional keywords while preserving the original option order.") },
      { id: "states", label: "Disabled and read-only", title: "Disabled and read-only", children: live("autocomplete-states", "Availability states", `<Stack gap="sm">
  <Autocomplete disabled defaultValue="viewer" options={${roleOptions}} />
  <Autocomplete readOnly defaultValue="operator" options={${roleOptions}} />
</Stack>`, stateScope, 'import { Autocomplete, Stack } from "@dravyn/ui-components";') },
      { id: "invalid-state", label: "Invalid state", title: "Invalid state", children: live("autocomplete-invalid", "Required selection", `<Stack gap="sm">
  <Autocomplete ariaLabel="Required role" invalid options={${roleOptions}} required placeholder="Select a role" />
  <ValidationMessage tone="error">Select a workspace role to continue.</ValidationMessage>
</Stack>`, stateScope, 'import { Autocomplete, Stack, ValidationMessage } from "@dravyn/ui-components";') },
      { id: "loading-state", label: "Loading state", title: "Loading state", children: live("autocomplete-loading", "Application-owned async state", `function Example() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!query) return undefined;
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timeout);
  }, [query]);
  return <Autocomplete inputValue={query} loading={loading} loadingText="Searching application-owned results..." onInputValueChange={setQuery} options={query ? ${roleOptions} : []} placeholder="Search roles" />;
}

render(<Example />);`, basicScope, 'import { Autocomplete } from "@dravyn/ui-components";', "The application owns debouncing, requests, cancellation, caching, and errors. This example only simulates loading.") },
      { id: "empty-state", label: "Empty state", title: "Empty state", children: live("autocomplete-empty", "No matching options", `<Autocomplete defaultOpen noOptionsText="No matching workspace roles" options={[]} placeholder="Search roles" />`, basicScope, 'import { Autocomplete } from "@dravyn/ui-components";') },
      { id: "custom-filtering", label: "Custom filtering", title: "Custom filtering", children: live("autocomplete-custom-filter", "Prefix-only filter", `<Autocomplete
  filterOptions={(options, query) => options.filter((option) => option.label.toLowerCase().startsWith(query.trim().toLowerCase()))}
  options={${roleOptions}}
  placeholder="Match role prefix"
/>`, basicScope, 'import { Autocomplete } from "@dravyn/ui-components";') },
      { id: "custom-option-rendering", label: "Custom option rendering", title: "Custom option rendering", children: live("autocomplete-render-option", "Rich visual option content", `<Autocomplete
  options={${roleOptions}}
  renderOption={(option, state) => <Stack gap="xs"><Text as="span" tone={state.selected ? "strong" : "default"}>{option.label}</Text>{option.description && <Caption>{option.description}</Caption>}</Stack>}
  placeholder="Choose a role"
/>`, stateScope, 'import { Autocomplete, Caption, Stack, Text } from "@dravyn/ui-components";', "Only the visual content is customized. The listbox roles, state, IDs, labels, and selection behavior remain owned by Autocomplete.") },
      { id: "field-composition", label: "Field composition", title: "Field composition", children: live("autocomplete-field", "Field relationship and form value", `<Field id="workspace-owner" label="Workspace owner" description="Search by name, team, or keyword." required>
  {(controlProps) => <Autocomplete {...controlProps} name="owner" options={${roleOptions}} placeholder="Select an owner" />}
</Field>`, stateScope, 'import { Autocomplete, Field } from "@dravyn/ui-components";') }
    ]}
    status="experimental"
    title="Autocomplete"
    useWhen={[
      "A larger known option set is easier to choose by typing part of the label.",
      "The app owns the options, including async loading and filtering workflows."
    ]}
  />;
}
