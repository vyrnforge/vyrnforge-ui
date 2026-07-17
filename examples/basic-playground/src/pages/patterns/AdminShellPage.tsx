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
} from "@vyrnforge/ui-components";

export function AdminShellPage() {
  return (
    <section className="vf-playground-panel">
      <PageHeader
        description="A dense internal-operations shell with a persistent top bar, sidebar navigation, page header, toolbar, and work panels."
        status={<Badge variant="info">admin pattern</Badge>}
        title="Admin shell pattern"
      />
      <AppShell
        className="vf-playground-shell-preview"
        fullHeight={false}
        header={
          <TopNav
            brand={
              <span className="vf-playground-top-brand">
                <span className="vf-playground-brand__mark">D</span>
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
        headerPosition="sticky"
        minHeight={520}
        scrollMode="content"
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
        sidebarPosition="sticky"
        sidebarWidth={260}
      >
        <div className="vf-playground-shell-preview__content">
          <PageHeader
            actions={<Button variant="primary">Create ticket</Button>}
            description="Prioritize incidents, review ownership, and hand off work without the shell owning app state."
            status={<Badge variant="warning">12 open</Badge>}
            title="Ticket triage"
          />
          <PageToolbar
            sticky
            left={<SearchInput aria-label="Search tickets" placeholder="Search tickets" />}
            right={
              <>
                <ToolbarButton active icon={<Icon name="Filter" />} label="Priority" />
                <ToolbarButton icon={<Icon name="Download" />} label="Export" />
              </>
            }
          />
          <div className="vf-playground-grid two">
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
