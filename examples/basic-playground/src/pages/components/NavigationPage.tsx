import { useState } from "react";
import { Badge, Breadcrumbs, Button, Icon, PageHeader, PageToolbar, SearchInput, SideNav, Tabs, Text, ToolbarButton } from "@vyrnforge/ui-components";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";

export function NavigationPage() {
  const [activeNav, setActiveNav] = useState("orders");
  const [activeTab, setActiveTab] = useState("activity");
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [{ id: "overview", label: "Overview", icon: <Icon name="Eye" /> }, { id: "orders", label: "Orders", icon: <Icon name="Columns" />, badge: "24" }, { id: "settings", label: "Settings", icon: <Icon name="Settings" />, children: [{ id: "profile", label: "Profile" }, { id: "billing", label: "Billing" }] }, { id: "disabled", label: "Disabled", icon: <Icon name="Warning" />, disabled: true }];

  return (
    <DemoPage
      accessibility="Mark the current page, use nav landmarks, and preserve the native keyboard behavior of tabs and buttons."
      avoid="Avoid SideNav for deeply nested trees or Tabs for unrelated destinations."
      description="Routing-agnostic navigation primitives for application shells, page context, and related work areas."
      importSnippet={'import { SideNav, TopNav, Breadcrumbs, Tabs, PageHeader } from "@vyrnforge/ui-components";'}
      packageName="@vyrnforge/ui-components"
      relatedComponents={["AppShell", "PageToolbar", "SegmentedControl"]}
      status="experimental"
      title="Navigation"
      usage="Keep route state in the consuming app and pass active identifiers plus selection callbacks into navigation components."
    >
      <DemoSection description="Build page context from a header and location trail." title="Page context">
        <DemoBlock code={'<PageHeader title="Orders" breadcrumbs={<Breadcrumbs items={items} />} actions={<Button>Create order</Button>} />'} preview={<PageHeader breadcrumbs={<Breadcrumbs items={[{ id: "home", label: "Home", href: "#" }, { id: "workspace", label: "Workspace", href: "#" }, { id: "orders", label: "Orders", current: true }]} />} actions={<Button variant="primary">Create order</Button>} description="Navigation primitives avoid routing assumptions while exposing accessible current states." status={<Badge variant="success">experimental</Badge>} title="Navigation primitives" />} title="Header and breadcrumbs" />
      </DemoSection>
      <DemoSection description="Use a persistent side navigation for major destinations and tabs for related content on the same page." title="Persistent and local navigation">
        <div className="vf-playground-demo-grid">
          <DemoBlock code={'<SideNav activeId={activeId} items={items} onSelect={handleSelect} />'} preview={<div className="vf-playground-nav-demo-frame"><SideNav activeId={activeNav} collapsed={collapsed} items={navItems} onSelect={(item) => setActiveNav(item.id)} /></div>} title="Side navigation" />
          <DemoBlock code={'<Tabs value={activeTab} onValueChange={setActiveTab} items={items} />'} preview={<div className="vf-playground-page-stack"><PageToolbar left={<SearchInput aria-label="Search records" placeholder="Search records" />} right={<><ToolbarButton icon={<Icon name="Refresh" />} label="Refresh" /><ToolbarButton active icon={<Icon name="Filter" />} label="Filters" /></>} /><Tabs value={activeTab} onValueChange={setActiveTab} items={[{ id: "activity", label: "Activity", badge: <Badge size="sm">8</Badge>, content: <Text>Activity tab content follows the controlled value.</Text> }, { id: "details", label: "Details", content: <Text>Details tab content is rendered as a tab panel.</Text> }, { id: "audit", label: "Audit", disabled: true }]} /><ToolbarButton active={collapsed} icon={<Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} />} label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((value) => !value)} size="sm" /></div>} title="Toolbar and tabs" />
        </div>
      </DemoSection>
    </DemoPage>
  );
}
