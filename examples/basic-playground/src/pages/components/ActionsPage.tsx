import { useState } from "react";
import { Button, ButtonGroup, CloseButton, Icon, IconButton, MoreButton, RefreshButton, SegmentedControl, ToolbarButton } from "@vyrnforge/ui-components";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";

export function ActionsPage() {
  const [density, setDensity] = useState("standard");
  const [viewMode, setViewMode] = useState("table");

  return (
    <DemoPage
      accessibility="Every icon-only action needs an aria-label. Keep visible labels in toolbars where the command is not obvious."
      avoid="Avoid using toolbar controls for a page-level business action such as Save or Create."
      description="Dense action controls for repeated operational commands and small mutually exclusive view choices."
      importSnippet={'import { IconButton, ToolbarButton, SegmentedControl } from "@vyrnforge/ui-components";'}
      packageName="@vyrnforge/ui-components"
      relatedComponents={["Button", "ButtonGroup", "Menu"]}
      status="candidate"
      title="Icon and toolbar actions"
      usage="Use IconButton for familiar utilities and ToolbarButton for repeated commands that benefit from a label."
    >
      <DemoSection description="Square, labelled utilities for compact control surfaces." title="Icon buttons">
        <DemoBlock code={'<IconButton aria-label="Refresh" tooltip="Refresh">\n  <Icon name="Refresh" />\n</IconButton>'} preview={<div className="dv-playground-control-grid"><IconButton aria-label="Search" tooltip="Search"><Icon name="Search" /></IconButton><IconButton aria-label="Filter" tooltip="Filter" variant="subtle"><Icon name="Filter" /></IconButton><IconButton aria-label="Delete" tooltip="Delete" variant="danger"><Icon name="Delete" /></IconButton><IconButton aria-label="Loading action" loading tooltip="Loading" /><IconButton aria-label="Disabled settings" disabled tooltip="Settings"><Icon name="Settings" /></IconButton><RefreshButton /><MoreButton /><CloseButton /></div>} title="Utility actions" />
      </DemoSection>
      <DemoSection description="Compact controls retain their command labels while fitting dense enterprise toolbars." title="Toolbar and mode controls">
        <DemoBlock code={'<ToolbarButton icon={<Icon name="Filter" />} label="Filters" active />'} preview={<div className="dv-playground-compact-toolbar"><ToolbarButton icon={<Icon name="Refresh" />} label="Refresh" tooltip="Refresh data" /><ToolbarButton active icon={<Icon name="Filter" />} label="Filters" tooltip="Filters active" /><ToolbarButton icon={<Icon name="Columns" />} label="Columns" /><ToolbarButton icon={<Icon name="Download" />} label="Export" /><ToolbarButton aria-label="More actions" icon={<Icon name="MoreHorizontal" />} tooltip="More actions" /></div>} title="Toolbar commands" />
        <DemoBlock code={'<SegmentedControl value={viewMode} onChange={setViewMode} options={options} />'} preview={<div className="dv-playground-control-grid"><ButtonGroup attached size="sm"><Button size="sm" variant="subtle">Day</Button><Button size="sm" variant="primary">Week</Button><Button size="sm" variant="subtle">Month</Button></ButtonGroup><SegmentedControl aria-label="Density" value={density} onChange={setDensity} options={[{ value: "compact", label: "Compact" }, { value: "standard", label: "Standard" }, { value: "comfortable", label: "Comfortable" }]} /><SegmentedControl aria-label="View mode" value={viewMode} onChange={setViewMode} options={[{ value: "table", label: "Table", icon: <Icon name="Columns" /> }, { value: "list", label: "List", icon: <Icon name="DragHandle" /> }, { value: "card", label: "Card", icon: <Icon name="Eye" /> }]} /></div>} title="Groups and segmented controls" />
      </DemoSection>
    </DemoPage>
  );
}
