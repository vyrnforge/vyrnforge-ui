import { useState } from "react";
import { Checkbox, Field, Heading, SearchInput, Select, TextInput } from "@dravyn/ui-components";

export function InputsPage() {
  const [checked, setChecked] = useState(true);

  return (
    <section className="playground-panel form-grid">
      <Heading size="md">Inputs and fields</Heading>
      <Field label="Display name" description="Plain text input with helper copy.">
        <TextInput aria-label="Display name" defaultValue="Mira Sutanto" />
      </Field>
      <Field label="Search" description="Search input keeps native input behavior.">
        <SearchInput aria-label="Search users" placeholder="Search users..." />
      </Field>
      <Field label="Region">
        <Select
          aria-label="Region"
          defaultValue="apac"
          options={[
            { label: "APAC", value: "apac" },
            { label: "EMEA", value: "emea" },
            { label: "AMER", value: "amer" }
          ]}
        />
      </Field>
      <Field label="Invalid field" invalid message="Use at least 8 characters.">
        <TextInput aria-label="Invalid field" invalid defaultValue="short" />
      </Field>
      <Field label="Disabled field">
        <TextInput aria-label="Disabled field" disabled defaultValue="Read only value" />
      </Field>
      <Checkbox
        checked={checked}
        label="Enable provisioning"
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
    </section>
  );
}
