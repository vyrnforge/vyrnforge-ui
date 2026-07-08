import { useState } from "react";
import { Button, Checkbox, Heading, Icon, Text } from "@dravyn/ui-components";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    email: true,
    audit: true,
    experimental: false
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
      <Checkbox
        checked={settings.email}
        label="Send workflow email notifications"
        onChange={(event) => setSettings({ ...settings, email: event.currentTarget.checked })}
      />
      <Checkbox
        checked={settings.audit}
        label="Require audit notes on high-risk changes"
        onChange={(event) => setSettings({ ...settings, audit: event.currentTarget.checked })}
      />
      <Checkbox
        checked={settings.experimental}
        label="Enable experimental layout primitives"
        onChange={(event) => setSettings({ ...settings, experimental: event.currentTarget.checked })}
      />
    </section>
  );
}
