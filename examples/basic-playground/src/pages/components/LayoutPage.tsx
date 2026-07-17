import { AppShell, Badge, Button, Card, Icon, Inline, PageToolbar, Panel, Section, SideNav, Stack, Text, TopNav } from "@vyrnforge/ui-components";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";

const shellNavItems = [{ id: "overview", label: "Overview", icon: <Icon name="Eye" /> }, ...Array.from({ length: 12 }, (_, index) => ({ id: `queue-${index + 1}`, label: `Work queue ${index + 1}`, icon: <Icon name="Columns" /> })), { id: "settings", label: "Settings", icon: <Icon name="Settings" /> }];
const longShellRows = Array.from({ length: 6 }, (_, index) => `Operational row ${index + 1}`);

export function LayoutPage() {
  return (
    <DemoPage
      accessibility="Use landmarks and heading structure supplied by Page, Section, Panel, and AppShell rather than recreating generic containers."
      avoid="Avoid nesting cards in cards or using AppShell inside a normal page layout."
      description="Composable layout primitives for task surfaces, page hierarchy, and persistent enterprise navigation."
      importSnippet={'import { AppShell, Card, Panel, Section, Stack, Inline } from "@vyrnforge/ui-components";'}
      packageName="@vyrnforge/ui-components"
      relatedComponents={["Page", "PageHeader", "PageToolbar", "SideNav"]}
      status="experimental"
      title="Layout primitives"
      usage="Use Panel to frame a task area, Stack and Inline for spacing, and AppShell only for application-level layout."
    >
      <DemoSection description="Cards and panels provide the surfaces; Stack and Inline provide rhythm without one-off CSS." title="Composition">
        <DemoBlock code={'<Panel title="Workspace settings">\n  <Stack gap="md">\n    <Inline justify="between">...</Inline>\n  </Stack>\n</Panel>'} preview={<Section title="Section" description="Section provides title, description, actions, and content layout." actions={<Button size="sm" variant="primary">Action</Button>}><Panel title="Panel" description="Panel frames a related task area."><Stack gap="md"><Inline justify="between"><Text tone="strong">Inline row</Text><Badge variant="info">metadata</Badge></Inline><div className="vf-playground-demo-grid"><Card variant="plain" padding="md"><Text>Plain card</Text></Card><Card variant="bordered" padding="md"><Text>Bordered card</Text></Card><Card variant="elevated" padding="md"><Text>Elevated card</Text></Card></div></Stack></Panel></Section>} title="Panels, stacks, and cards" />
      </DemoSection>
      <DemoSection description="The shell keeps the sidebar and content regions responsible for their own scrolling." title="Application shell">
        <DemoBlock code={'<AppShell header={<TopNav brand="Operations" />} sidebar={<SideNav items={items} />} scrollMode="content" sidebarPosition="sticky">\n  <Page>...</Page>\n</AppShell>'} preview={<AppShell className="vf-playground-shell-preview" fullHeight={false} header={<TopNav brand="Operations" actions={<Badge tone="subtle">sticky</Badge>} />} headerPosition="sticky" minHeight={420} scrollMode="content" sidebar={<SideNav activeId="queue-3" items={shellNavItems} />} sidebarPosition="sticky" sidebarWidth={190}><div className="vf-playground-shell-preview__content"><PageToolbar sticky left={<Text tone="strong">Toolbar</Text>} right={<Badge variant="info">content scroll</Badge>} />{longShellRows.map((row) => <Panel key={row} title={row}><Text tone="muted">Long content confirms the sidebar stays visible while the work area scrolls.</Text></Panel>)}</div></AppShell>} title="Persistent navigation" />
      </DemoSection>
    </DemoPage>
  );
}
