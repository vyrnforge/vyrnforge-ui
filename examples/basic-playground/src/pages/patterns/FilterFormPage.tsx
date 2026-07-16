import { useState } from "react";
import {
  Button,
  Autocomplete,
  DateInput,
  Field,
  Heading,
  Icon,
  Inline,
  SearchInput,
  Select,
  Stack,
  Text
} from "@dravyn/ui-components";

export function FilterFormPage() {
  const [query, setQuery] = useState("");

  return (
    <section className="dv-playground-panel dv-playground-form-grid">
      <div>
        <Heading size="md">Filter records</Heading>
        <Text tone="muted">A compact native filter form for operational lists and reports.</Text>
      </div>
      <Field htmlFor="filter-query" label="Search" orientation="horizontal">
        <SearchInput id="filter-query" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search requests" value={query} />
      </Field>
      <div className="dv-playground-grid two">
        <Field htmlFor="filter-status" label="Status">
          <Select id="filter-status" defaultValue="open" options={[{ label: "Open", value: "open" }, { label: "Pending", value: "pending" }, { label: "Closed", value: "closed" }]} />
        </Field>
        <Field id="filter-owner" label="Owner">
          {(controlProps) => <Autocomplete {...controlProps} options={[{ label: "All owners", value: "all" }, { label: "Finance Operations", value: "finance", keywords: ["finance"] }, { label: "Platform Engineering", value: "platform", keywords: ["platform"] }, { label: "Security Governance", value: "security", keywords: ["security"] }, { label: "Customer Success", value: "customer", keywords: ["customer"] }]} placeholder="Find an owner" />}
        </Field>
      </div>
      <div className="dv-playground-grid two">
        <Field htmlFor="filter-from" label="Created from"><DateInput id="filter-from" /></Field>
        <Field htmlFor="filter-to" label="Created to"><DateInput id="filter-to" /></Field>
      </div>
      <Inline gap="sm" justify="end">
        <Button onClick={() => setQuery("")} variant="subtle">Clear</Button>
        <Button leftSlot={<Icon name="Filter" />} variant="primary">Apply filters</Button>
      </Inline>
    </section>
  );
}
