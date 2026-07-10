import {
  AppShell,
  Badge,
  Button,
  Icon,
  PageHeader,
  PageToolbar,
  Panel,
  SearchInput,
  SideNav,
  Text,
  ToolbarButton,
  TopNav
} from "@dravyn/ui-components";

export function AdminShellPage() {
  return (
    <section className="playground-panel">
      <PageHeader
        description="A dense internal-operations shell with a persistent top bar, sidebar navigation, page header, toolbar, and work panels."
        status={<Badge variant="info">admin pattern</Badge>}
        title="Admin shell pattern"
      />
      <AppShell
        className="shell-preview"
        header={
          <TopNav
            brand={
              <span className="playground-top-brand">
                <span className="playground-brand__mark">D</span>
                Operations Console
              </span>
            }
            actions={
              <>
                <ToolbarButton icon={<Icon name="Refresh" />} label="Sync" />
                <ToolbarButton icon={<Icon name="Settings" />} label="Settings" />
              </>
            }
            userArea={<Badge tone="subtle">Admin</Badge>}
          />
        }
        sidebar={
          <SideNav
            activeId="tickets"
            items={[
              { id: "dashboard", label: "Dashboard", icon: <Icon name="Eye" /> },
              { id: "tickets", label: "Tickets", icon: <Icon name="Warning" />, badge: "12" },
              { id: "assets", label: "Assets", icon: <Icon name="Columns" /> },
              { id: "settings", label: "Settings", icon: <Icon name="Settings" /> }
            ]}
          />
        }
        sidebarWidth={260}
      >
        <div className="shell-preview__content">
          <PageHeader
            actions={<Button variant="primary">Create ticket</Button>}
            description="Prioritize incidents, review ownership, and hand off work without the shell owning app state."
            status={<Badge variant="warning">12 open</Badge>}
            title="Ticket triage"
          />
          <PageToolbar
            left={<SearchInput aria-label="Search tickets" placeholder="Search tickets" />}
            right={
              <>
                <ToolbarButton active icon={<Icon name="Filter" />} label="Priority" />
                <ToolbarButton icon={<Icon name="Download" />} label="Export" />
              </>
            }
          />
          <div className="playground-grid two">
            <Panel title="Queue health" description="Live operational summary.">
              <Text>4 critical tickets, 8 standard tickets, 2 pending review.</Text>
            </Panel>
            <Panel title="Owner coverage" description="Current response ownership.">
              <Text>Platform, Security, and Customer Success are actively assigned.</Text>
            </Panel>
          </div>
        </div>
      </AppShell>
    </section>
  );
}
