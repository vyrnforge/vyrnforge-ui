import { useState } from "react";
import {
  Checkbox,
  DateInput,
  DateTimeInput,
  Field,
  Heading,
  MultiSelect,
  NumberInput,
  Radio,
  RadioGroup,
  SearchInput,
  Select,
  Switch,
  Textarea,
  TextInput,
  ValidationMessage
} from "@dravyn/ui-components";

export function InputsPage() {
  const [checked, setChecked] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [roles, setRoles] = useState(["owner", "approver"]);

  return (
    <div className="dv-playground-page-stack">
      <section className="dv-playground-panel dv-playground-form-grid">
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
        <div className="dv-playground-grid two">
          <Field htmlFor="seat-count" label="Seat limit" warning="Integer-only input blocks exponent characters.">
            <NumberInput id="seat-count" mode="integer" min={1} max={500} defaultValue={120} />
          </Field>
          <Field htmlFor="discount-rate" label="Discount rate">
            <NumberInput id="discount-rate" mode="decimal" min={0} max={100} step={0.01} defaultValue={12.5} />
          </Field>
        </div>
        <div className="dv-playground-grid two">
          <Field htmlFor="start-date" label="Start date" required>
            <DateInput id="start-date" defaultValue="2026-07-10" />
          </Field>
          <Field htmlFor="review-at" label="Review at">
            <DateTimeInput id="review-at" defaultValue="2026-07-10T09:30" />
          </Field>
        </div>
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
        <Switch
          checked={alertsEnabled}
          label="Enable delivery alerts"
          description="Switch uses a native checkbox with role=switch."
          onCheckedChange={setAlertsEnabled}
        />
        <ValidationMessage tone="success">All native controls preserve value/defaultValue/onChange props.</ValidationMessage>
      </section>

      <section className="dv-playground-panel dv-playground-form-grid">
        <Heading size="md">Choice controls</Heading>
        <RadioGroup
          label="Billing cycle"
          description="RadioGroup uses fieldset and native radio inputs."
          value={billingCycle}
          onValueChange={setBillingCycle}
          orientation="horizontal"
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "annual", label: "Annual", description: "Best value" }
          ]}
        />
        <Radio
          checked
          label="Standalone radio"
          description="Use inside custom native groups when RadioGroup is not enough."
          name="standalone-demo"
          value="enabled"
        />
        <Field label="Roles" description="MultiSelect keeps selection local unless controlled by the app.">
          <MultiSelect
            aria-label="Roles"
            searchable
            value={roles}
            onValueChange={setRoles}
            options={[
              { value: "owner", label: "Owner", description: "Can manage workspace settings" },
              { value: "approver", label: "Approver", description: "Can approve requests" },
              { value: "viewer", label: "Viewer" },
              { value: "billing", label: "Billing", disabled: true }
            ]}
          />
        </Field>
        <ValidationMessage tone="info">Searchable and clearable behavior is intentionally simple for S3.</ValidationMessage>
      </section>
    </div>
  );
}
