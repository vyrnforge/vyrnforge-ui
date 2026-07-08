import { useState } from "react";
import { Button, Checkbox, Field, Heading, Icon, Select, Text, TextInput } from "@dravyn/ui-components";

export function FormPage() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <section className="playground-panel form-grid">
      <div>
        <Heading size="md">Request form</Heading>
        <Text tone="muted">A realistic form pattern using current candidate primitives.</Text>
      </div>
      <Field label="Request title">
        <TextInput aria-label="Request title" defaultValue="Provision reporting workspace" />
      </Field>
      <Field label="Owner">
        <TextInput aria-label="Owner" defaultValue="Finance Operations" />
      </Field>
      <Field label="Priority">
        <Select
          aria-label="Priority"
          defaultValue="high"
          options={[
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" }
          ]}
        />
      </Field>
      <Field label="Justification" invalid message="A justification is required before submission.">
        <TextInput aria-label="Justification" invalid placeholder="Add business reason" />
      </Field>
      <Checkbox
        checked={acknowledged}
        label="I reviewed the access policy"
        onChange={(event) => setAcknowledged(event.currentTarget.checked)}
      />
      <div className="inline-actions">
        <Button leftSlot={<Icon name="Check" />} variant="primary" disabled={!acknowledged}>Submit request</Button>
        <Button leftSlot={<Icon name="Edit" />} variant="subtle">Save draft</Button>
      </div>
    </section>
  );
}
