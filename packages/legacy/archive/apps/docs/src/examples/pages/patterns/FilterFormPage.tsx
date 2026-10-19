import { useState } from "react";
import {
  Autocomplete,
  Button,
  DateInput,
  Field,
  Icon,
  Inline,
  SearchInput,
  Section,
  Select,
  Stack,
} from "@vyrnforge/ui-components";

export function FilterFormPage() {
  const [query, setQuery] = useState("");

  return (
    <Section
      className="vf-docs-example-form"
      description="A compact native filter form for operational lists and reports."
      title="Filter records"
    >
      <Stack gap="md">
        <Field htmlFor="filter-query" label="Search" orientation="horizontal">
          <SearchInput
            id="filter-query"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search requests"
            value={query}
          />
        </Field>
        <div className="vf-docs-example-grid vf-docs-example-grid--two">
          <Field htmlFor="filter-status" label="Status">
            <Select
              id="filter-status"
              defaultValue="open"
              options={[
                { label: "Open", value: "open" },
                { label: "Pending", value: "pending" },
                { label: "Closed", value: "closed" },
              ]}
            />
          </Field>
          <Field id="filter-owner" label="Owner">
            {(controlProps) => (
              <Autocomplete
                {...controlProps}
                options={[
                  { label: "All owners", value: "all" },
                  {
                    label: "Finance Operations",
                    value: "finance",
                    keywords: ["finance"],
                  },
                  {
                    label: "Platform Engineering",
                    value: "platform",
                    keywords: ["platform"],
                  },
                  {
                    label: "Security Governance",
                    value: "security",
                    keywords: ["security"],
                  },
                  {
                    label: "Customer Success",
                    value: "customer",
                    keywords: ["customer"],
                  },
                ]}
                placeholder="Find an owner"
              />
            )}
          </Field>
        </div>
        <div className="vf-docs-example-grid vf-docs-example-grid--two">
          <Field htmlFor="filter-from" label="Created from">
            <DateInput id="filter-from" />
          </Field>
          <Field htmlFor="filter-to" label="Created to">
            <DateInput id="filter-to" />
          </Field>
        </div>
        <Inline gap="sm" justify="end" wrap>
          <Button onClick={() => setQuery("")} variant="subtle">
            Clear
          </Button>
          <Button leftSlot={<Icon name="Filter" />} variant="primary">
            Apply filters
          </Button>
        </Inline>
      </Stack>
    </Section>
  );
}
