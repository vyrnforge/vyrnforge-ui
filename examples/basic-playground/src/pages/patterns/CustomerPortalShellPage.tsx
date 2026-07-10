import {
  AppShell,
  Badge,
  Button,
  Breadcrumbs,
  Icon,
  PageHeader,
  Panel,
  SideNav,
  Tabs,
  Text,
  TopNav
} from "@dravyn/ui-components";

export function CustomerPortalShellPage() {
  return (
    <section className="playground-panel" data-theme="enterprise">
      <PageHeader
        description="A customer-facing portal shell that keeps navigation predictable while letting the application own account, auth, and workflow state."
        status={<Badge variant="info">portal pattern</Badge>}
        title="Customer portal shell pattern"
      />
      <AppShell
        className="shell-preview"
        header={
          <TopNav
            brand={
              <span className="playground-top-brand">
                <span className="playground-brand__mark">D</span>
                Customer Portal
              </span>
            }
            actions={<Button size="sm" variant="subtle">Contact support</Button>}
            userArea={<Badge variant="success">Acme Co.</Badge>}
          />
        }
        sidebar={
          <SideNav
            activeId="subscriptions"
            items={[
              { id: "home", label: "Home", icon: <Icon name="Eye" /> },
              { id: "subscriptions", label: "Subscriptions", icon: <Icon name="Columns" /> },
              { id: "billing", label: "Billing", icon: <Icon name="Download" /> },
              { id: "support", label: "Support", icon: <Icon name="Info" />, badge: "New" }
            ]}
          />
        }
        sidebarWidth={250}
      >
        <div className="shell-preview__content">
          <PageHeader
            breadcrumbs={
              <Breadcrumbs
                items={[
                  { id: "portal", label: "Portal", href: "#" },
                  { id: "subscriptions", label: "Subscriptions", current: true }
                ]}
              />
            }
            actions={<Button variant="primary">Upgrade plan</Button>}
            description="Plan status, usage, billing milestones, and support actions in one page."
            status={<Badge variant="success">Active</Badge>}
            title="Enterprise subscription"
          />
          <Tabs
            defaultValue="overview"
            variant="contained"
            items={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <Panel title="Usage" description="Current subscription usage.">
                    <Text>72% of included monthly events used. Renewal is scheduled for August.</Text>
                  </Panel>
                )
              },
              {
                id: "billing",
                label: "Billing",
                content: (
                  <Panel title="Billing contact" description="Customer-owned account data.">
                    <Text>finance@acme.example receives invoices and renewal notices.</Text>
                  </Panel>
                )
              }
            ]}
          />
        </div>
      </AppShell>
    </section>
  );
}
