import { useState } from "react";
import {
  Checkbox,
  Field,
  Heading,
  SearchInput,
  Select,
  Textarea,
  TextInput,
  ValidationMessage
} from "@dravyn/ui-components";

export function InputsPage() {
  const [checked, setChecked] = useState(true);

  return (
    <section className="playground-panel form-grid">
      <Heading size="md">Inputs and fields</Heading>
      <Field
        description="Plain text input with helper copy."
        htmlFor="display-name"
        label="Display name"
        required
      >
        <TextInput id="display-name" defaultValue="Mira Sutanto" />
      </Field>
      <Field htmlFor="user-search" label="Search" description="Search input keeps native input behavior.">
        <SearchInput id="user-search" placeholder="Search users..." />
      </Field>
      <Field htmlFor="region" label="Region">
        <Select
          id="region"
          defaultValue="apac"
          options={[
            { label: "APAC", value: "apac" },
            { label: "EMEA", value: "emea" },
            { label: "AMER", value: "amer" }
          ]}
        />
      </Field>
      <Field htmlFor="invalid-field" label="Invalid field" error="Use at least 8 characters.">
        <TextInput id="invalid-field" invalid defaultValue="short" />
      </Field>
      <Field disabled htmlFor="disabled-field" label="Disabled field">
        <TextInput id="disabled-field" disabled defaultValue="Read only value" />
      </Field>
      <Field htmlFor="notes" label="Notes">
        <Textarea id="notes" defaultValue="Textarea keeps native resizing and validation behavior." />
      </Field>
      <Checkbox
        checked={checked}
        label="Enable provisioning"
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
      <ValidationMessage tone="success">All native controls preserve value/defaultValue/onChange props.</ValidationMessage>
    </section>
  );
}
