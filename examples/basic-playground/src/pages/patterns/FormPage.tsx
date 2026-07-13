import { useState } from "react";
import {
  Button,
  Checkbox,
  DateInput,
  DateTimeInput,
  Field,
  Heading,
  Icon,
  MultiSelect,
  NumberInput,
  RadioGroup,
  Select,
  Text,
  TextInput,
  ValidationMessage
} from "@dravyn/ui-components";

export function FormPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [requestType, setRequestType] = useState("access");
  const [roles, setRoles] = useState(["viewer"]);

  return (
    <section className="dv-playground-panel dv-playground-form-grid">
      <div>
        <Heading size="md">Request form</Heading>
        <Text tone="muted">A create/edit pattern using completed native form primitives.</Text>
      </div>
      <Field id="request-title" label="Request title" required>
        {(controlProps) => <TextInput {...controlProps} defaultValue="Provision reporting workspace" />}
      </Field>
      <Field label="Owner" htmlFor="request-owner">
        <TextInput id="request-owner" defaultValue="Finance Operations" />
      </Field>
      <RadioGroup
        label="Request type"
        value={requestType}
        onValueChange={setRequestType}
        orientation="horizontal"
        options={[
          { value: "access", label: "Access" },
          { value: "workspace", label: "Workspace" },
          { value: "change", label: "Change" }
        ]}
      />
      <div className="dv-playground-grid two">
        <Field label="Priority" htmlFor="request-priority">
          <Select
            id="request-priority"
            defaultValue="high"
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" }
            ]}
          />
        </Field>
        <Field label="Risk score" htmlFor="risk-score" warning="Scores above 70 require audit review.">
          <NumberInput id="risk-score" mode="integer" min={0} max={100} defaultValue={74} />
        </Field>
      </div>
      <div className="dv-playground-grid two">
        <Field label="Needed by" htmlFor="needed-by" required>
          <DateInput id="needed-by" defaultValue="2026-07-17" />
        </Field>
        <Field label="Review meeting" htmlFor="review-meeting">
          <DateTimeInput id="review-meeting" defaultValue="2026-07-11T10:00" />
        </Field>
      </div>
      <Field label="Roles" description="Selected roles render as compact chips.">
        <MultiSelect
          aria-label="Requested roles"
          searchable
          value={roles}
          onValueChange={setRoles}
          options={[
            { value: "viewer", label: "Viewer" },
            { value: "editor", label: "Editor" },
            { value: "approver", label: "Approver" },
            { value: "admin", label: "Admin", description: "Requires security approval" }
          ]}
        />
      </Field>
      <Field id="justification" label="Justification" error="A justification is required before submission." required>
        {(controlProps) => <TextInput {...controlProps} placeholder="Add business reason" />}
      </Field>
      <Checkbox
        checked={acknowledged}
        label="I reviewed the access policy"
        onChange={(event) => setAcknowledged(event.currentTarget.checked)}
      />
      <ValidationMessage tone={acknowledged ? "success" : "info"}>
        Submit is enabled after policy acknowledgement.
      </ValidationMessage>
      <div className="dv-playground-inline-actions dv-playground-form-footer">
        <Button leftSlot={<Icon name="Check" />} variant="primary" disabled={!acknowledged}>Submit request</Button>
        <Button leftSlot={<Icon name="Edit" />} variant="subtle">Save draft</Button>
      </div>
    </section>
  );
}
