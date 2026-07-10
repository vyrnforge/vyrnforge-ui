import {
  AppShell,
  Badge,
  Button,
  Card,
  Heading,
  Icon,
  Inline,
  PageToolbar,
  Panel,
  Section,
  SideNav,
  Stack,
  Text,
  TopNav
} from "@dravyn/ui-components";

const shellNavItems = [
  { id: "overview", label: "Overview", icon: <Icon name="Eye" /> },
  ...Array.from({ length: 18 }, (_, index) => ({
    id: `queue-${index + 1}`,
    label: `Work queue ${index + 1}`,
    icon: <Icon name="Columns" />,
    badge: index === 7 ? "8" : undefined
  })),
  { id: "settings", label: "Settings", icon: <Icon name="Settings" /> }
];

const longShellRows = Array.from({ length: 12 }, (_, index) => `Operational row ${index + 1}`);

export function LayoutPage() {
  return (
    <section className="dv-playground-panel">
      <div className="dv-playground-card-heading">
        <Heading size="md">Layout primitives</Heading>
        <Badge variant="success">candidate</Badge>
      </div>
      <Section
        title="Section"
        description="Section provides title, description, actions, and content layout."
        actions={<Button size="sm" variant="primary">Action</Button>}
      >
        <Panel title="Panel" description="Panel frames a related task area.">
          <Stack gap="md">
            <Inline justify="between">
              <Text tone="strong">Inline row</Text>
              <Badge variant="info">metadata</Badge>
            </Inline>
            <div className="dv-playground-grid three">
              <Card variant="plain" padding="md"><Text>Plain card</Text></Card>
              <Card variant="bordered" padding="md"><Text>Bordered card</Text></Card>
              <Card variant="elevated" padding="md"><Text>Elevated card</Text></Card>
            </div>
          </Stack>
        </Panel>
      </Section>
      <Section
        title="AppShell scroll modes"
        description="Page, content, and split modes keep navigation predictable for different app layouts."
      >
        <div className="dv-playground-grid three">
          {(["page", "content", "split"] as const).map((scrollMode) => (
            <AppShell
              className="dv-playground-shell-mode-preview"
              fullHeight={false}
              header={
                <TopNav
                  brand={<span className="dv-playground-top-brand">Mode: {scrollMode}</span>}
                  actions={<Badge tone="subtle">sticky</Badge>}
                />
              }
              headerPosition="sticky"
              key={scrollMode}
              minHeight={360}
              scrollMode={scrollMode}
              sidebar={
                <SideNav
                  activeId="queue-8"
                  items={shellNavItems}
                />
              }
              sidebarPosition="sticky"
              sidebarWidth={190}
            >
              <div className="dv-playground-shell-preview__content">
                <PageToolbar
                  sticky
                  left={<Text tone="strong">Toolbar</Text>}
                  right={<Badge variant="info">{scrollMode}</Badge>}
                />
                <div className="dv-playground-mini-list">
                  {longShellRows.map((row) => (
                    <Panel key={`${scrollMode}-${row}`} title={row}>
                      <Text tone="muted">
                        Long content confirms the sidebar stays visible while the work area scrolls.
                      </Text>
                    </Panel>
                  ))}
                </div>
              </div>
            </AppShell>
          ))}
        </div>
      </Section>
    </section>
  );
}
