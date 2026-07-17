import { useState } from "react";
import {
  Button,
  Autocomplete,
  Field,
  Heading,
  Icon,
  RadioGroup,
  Select,
  Switch,
  Text,
  TextInput,
  ToastProvider,
  useToast,
  ValidationMessage
} from "@vyrnforge/ui-components";

export function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsPageContent />
    </ToastProvider>
  );
}

function SettingsPageContent() {
  const toast = useToast();
  const [settings, setSettings] = useState({
    email: true,
    audit: true,
    experimental: false,
    region: "apac",
    workspace: "revenue-operations",
    workspaceName: "Revenue operations",
    reviewCycle: "monthly"
  });

  return (
    <section className="vf-playground-panel vf-playground-settings-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Workspace settings</Heading>
          <Text tone="muted">Sectioned settings built from native controls and shared tokens.</Text>
        </div>
        <Button
          leftSlot={<Icon name="Check" />}
          onClick={() => toast.success({
            title: "Settings saved",
            description: "Workspace defaults were updated."
          })}
          variant="primary"
        >
          Save settings
        </Button>
      </div>
      <Field label="Workspace name" htmlFor="workspace-name" orientation="horizontal">
        <TextInput
          id="workspace-name"
          value={settings.workspaceName}
          onChange={(event) => setSettings({ ...settings, workspaceName: event.currentTarget.value })}
        />
      </Field>
      <ValidationMessage tone="info">Changes apply to new workspace requests after saving.</ValidationMessage>
      <Field label="Default region" htmlFor="settings-region" orientation="horizontal">
        <Select
          id="settings-region"
          value={settings.region}
          onChange={(event) => setSettings({ ...settings, region: event.currentTarget.value })}
          options={[
            { label: "APAC", value: "apac" },
            { label: "EMEA", value: "emea" },
            { label: "AMER", value: "amer" }
          ]}
        />
      </Field>
      <Field id="settings-workspace" label="Default workspace" orientation="horizontal" description="Search larger workspace directories by name or team.">
        {(controlProps) => <Autocomplete {...controlProps} onValueChange={(workspace) => setSettings({ ...settings, workspace: workspace ?? "" })} options={[
          { value: "revenue-operations", label: "Revenue Operations", keywords: ["revenue", "finance"] },
          { value: "platform-services", label: "Platform Services", keywords: ["platform", "engineering"] },
          { value: "customer-analytics", label: "Customer Analytics", keywords: ["analytics", "customer"] },
          { value: "security-oversight", label: "Security Oversight", keywords: ["security"] }
        ]} value={settings.workspace} />}
      </Field>
      <RadioGroup
        label="Access review cycle"
        value={settings.reviewCycle}
        onValueChange={(reviewCycle) => setSettings({ ...settings, reviewCycle })}
        orientation="horizontal"
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "Quarterly" },
          { value: "annual", label: "Annual" }
        ]}
      />
      <div className="vf-playground-settings-switch-list">
        <Switch
          checked={settings.email}
          label="Send workflow email notifications"
          description="Notify owners when approvals or escalations change."
          onCheckedChange={(email) => setSettings({ ...settings, email })}
        />
        <Switch
          checked={settings.audit}
          label="Require audit notes on high-risk changes"
          description="Ask users for context before sensitive updates."
          onCheckedChange={(audit) => setSettings({ ...settings, audit })}
        />
        <Switch
          checked={settings.experimental}
          label="Enable experimental layout primitives"
          description="Expose experimental components in internal workspaces."
          onCheckedChange={(experimental) => setSettings({ ...settings, experimental })}
        />
      </div>
    </section>
  );
}
