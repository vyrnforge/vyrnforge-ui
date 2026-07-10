import { useState } from "react";
import {
  Badge,
  Breadcrumbs,
  Button,
  Heading,
  Icon,
  PageHeader,
  PageToolbar,
  SearchInput,
  SideNav,
  Tabs,
  Text,
  ToolbarButton
} from "@dravyn/ui-components";

export function NavigationPage() {
  const [activeNav, setActiveNav] = useState("orders");
  const [activeTab, setActiveTab] = useState("activity");
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { id: "overview", label: "Overview", icon: <Icon name="Eye" /> },
    { id: "orders", label: "Orders", icon: <Icon name="Columns" />, badge: "24" },
    {
      id: "settings",
      label: "Settings",
      icon: <Icon name="Settings" />,
      children: [
        { id: "profile", label: "Profile" },
        { id: "billing", label: "Billing" }
      ]
    },
    { id: "disabled", label: "Disabled", icon: <Icon name="Warning" />, disabled: true }
  ];

  return (
    <div className="page-stack">
      <section className="playground-panel">
        <PageHeader
          breadcrumbs={
            <Breadcrumbs
              items={[
                { id: "home", label: "Home", href: "#" },
                { id: "workspace", label: "Workspace", href: "#" },
                { id: "orders", label: "Orders", current: true }
              ]}
            />
          }
          actions={<Button variant="primary">Create order</Button>}
          description="Navigation primitives avoid routing assumptions while still exposing accessible links, buttons, active states, and current location."
          status={<Badge variant="success">experimental</Badge>}
          title="Navigation primitives"
        />
      </section>

      <section className="playground-grid two">
        <div className="playground-card">
          <div className="card-heading">
            <Heading size="sm">SideNav</Heading>
            <ToolbarButton
              active={collapsed}
              icon={<Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} />}
              label={collapsed ? "Expand" : "Collapse"}
              onClick={() => setCollapsed((value) => !value)}
              size="sm"
            />
          </div>
          <div className="nav-demo-frame">
            <SideNav
              activeId={activeNav}
              collapsed={collapsed}
              items={navItems}
              onSelect={(item) => setActiveNav(item.id)}
            />
          </div>
        </div>

        <div className="playground-card">
          <Heading size="sm">PageToolbar + Tabs</Heading>
          <PageToolbar
            left={<SearchInput aria-label="Search records" placeholder="Search records" />}
            right={
              <>
                <ToolbarButton icon={<Icon name="Refresh" />} label="Refresh" />
                <ToolbarButton active icon={<Icon name="Filter" />} label="Filters" />
              </>
            }
          />
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            items={[
              { id: "activity", label: "Activity", badge: <Badge size="sm">8</Badge>, content: <Text>Activity tab content follows the controlled value.</Text> },
              { id: "details", label: "Details", content: <Text>Details tab content is rendered as a tab panel.</Text> },
              { id: "audit", label: "Audit", disabled: true }
            ]}
          />
          <Tabs
            defaultValue="summary"
            size="sm"
            variant="pills"
            items={[
              { id: "summary", label: "Summary", content: <Text>Uncontrolled pills variant.</Text> },
              { id: "history", label: "History", content: <Text>History content.</Text> }
            ]}
          />
        </div>
      </section>
    </div>
  );
}
