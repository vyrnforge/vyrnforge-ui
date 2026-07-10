import { useState } from "react";
import {
  Button,
  Field,
  Heading,
  Icon,
  RadioGroup,
  Select,
  Switch,
  Text,
  TextInput
} from "@dravyn/ui-components";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    email: true,
    audit: true,
    experimental: false,
    region: "apac",
    workspaceName: "Revenue operations",
    reviewCycle: "monthly"
  });

  return (
    <section className="playground-panel settings-panel">
      <div className="section-heading">
        <div>
          <Heading size="md">Workspace settings</Heading>
          <Text tone="muted">Sectioned settings built from native controls and shared tokens.</Text>
        </div>
        <Button leftSlot={<Icon name="Check" />} variant="primary">Save settings</Button>
      </div>
      <Field label="Workspace name" htmlFor="workspace-name" orientation="horizontal">
        <TextInput
          id="workspace-name"
          value={settings.workspaceName}
          onChange={(event) => setSettings({ ...settings, workspaceName: event.currentTarget.value })}
        />
      </Field>
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
      <div className="settings-switch-list">
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
