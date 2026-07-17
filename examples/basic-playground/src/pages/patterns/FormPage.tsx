import { useState } from "react";
import {
  Button,
  Autocomplete,
  Checkbox,
  DateInput,
  DateTimeInput,
  Field,
  Heading,
  Icon,
  InlineMessage,
  MultiSelect,
  NumberInput,
  RadioGroup,
  Select,
  Text,
  TextInput,
  ToastProvider,
  useToast,
  ValidationMessage
} from "@vyrnforge/ui-components";

export function FormPage() {
  return (
    <ToastProvider>
      <FormPageContent />
    </ToastProvider>
  );
}

function FormPageContent() {
  const toast = useToast();
  const [acknowledged, setAcknowledged] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [requestType, setRequestType] = useState("access");
  const [roles, setRoles] = useState(["viewer"]);

  return (
    <section className="vf-playground-panel vf-playground-form-grid">
      <div>
        <Heading size="md">Request form</Heading>
        <Text tone="muted">A create/edit pattern using completed native form primitives.</Text>
      </div>
      <Field id="request-title" label="Request title" required>
        {(controlProps) => <TextInput {...controlProps} defaultValue="Provision reporting workspace" />}
      </Field>
      <Field id="request-owner" label="Owner" description="Search the workspace owner directory.">
        {(controlProps) => <Autocomplete {...controlProps} name="owner" defaultValue="finance-operations" options={[
          { value: "finance-operations", label: "Finance Operations", keywords: ["finance", "operations"] },
          { value: "platform-engineering", label: "Platform Engineering", keywords: ["platform"] },
          { value: "security-governance", label: "Security Governance", keywords: ["security"] },
          { value: "customer-success", label: "Customer Success", keywords: ["customer"] }
        ]} />}
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
      <div className="vf-playground-grid two">
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
      <div className="vf-playground-grid two">
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
      {apiError && (
        <InlineMessage variant="danger" title="Could not create request">
          Resolve the highlighted fields and try again. This persistent message stays in context while the toast is transient.
        </InlineMessage>
      )}
      <div className="vf-playground-inline-actions vf-playground-form-footer">
        <Button
          disabled={!acknowledged}
          leftSlot={<Icon name="Check" />}
          onClick={() => {
            setApiError(false);
            toast.success({
              title: "Request created",
              description: "The access request was added to the review queue."
            });
          }}
          variant="primary"
        >
          Submit request
        </Button>
        <Button
          leftSlot={<Icon name="Warning" />}
          onClick={() => {
            setApiError(true);
            toast.error({
              title: "Create failed",
              description: "A persistent error explains how to recover."
            });
          }}
          variant="subtle"
        >
          Simulate failure
        </Button>
        <Button leftSlot={<Icon name="Edit" />} variant="subtle">Save draft</Button>
      </div>
    </section>
  );
}
