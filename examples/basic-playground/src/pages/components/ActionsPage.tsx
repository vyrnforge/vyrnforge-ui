import { useState } from "react";
import {
  Button,
  ButtonGroup,
  CloseButton,
  Heading,
  Icon,
  IconButton,
  MoreButton,
  RefreshButton,
  SegmentedControl,
  Text,
  ToolbarButton
} from "@dravyn/ui-components";

export function ActionsPage() {
  const [density, setDensity] = useState("standard");
  const [viewMode, setViewMode] = useState("table");

  return (
    <div className="page-stack">
      <section className="playground-panel">
        <Heading size="md">Icon-only actions</Heading>
        <Text tone="muted">Icon-only controls stay square, compact, and labelled for assistive tech.</Text>
        <div className="control-grid">
          <IconButton aria-label="Search" tooltip="Search">
            <Icon name="Search" />
          </IconButton>
          <IconButton aria-label="Filter" tooltip="Filter" variant="subtle">
            <Icon name="Filter" />
          </IconButton>
          <IconButton aria-label="Delete" tooltip="Delete" variant="danger">
            <Icon name="Delete" />
          </IconButton>
          <IconButton aria-label="Loading action" loading tooltip="Loading" />
          <IconButton aria-label="Disabled settings" disabled tooltip="Settings">
            <Icon name="Settings" />
          </IconButton>
          <RefreshButton />
          <MoreButton />
          <CloseButton />
        </div>
      </section>

      <section className="playground-panel">
        <Heading size="md">Toolbar buttons</Heading>
        <div className="compact-toolbar">
          <ToolbarButton icon={<Icon name="Refresh" />} label="Refresh" tooltip="Refresh data" />
          <ToolbarButton active icon={<Icon name="Filter" />} label="Filters" tooltip="Filters active" />
          <ToolbarButton icon={<Icon name="Columns" />} label="Columns" />
          <ToolbarButton icon={<Icon name="Download" />} label="Export" />
          <ToolbarButton aria-label="More actions" icon={<Icon name="MoreHorizontal" />} tooltip="More actions" />
        </div>
      </section>

      <section className="playground-panel">
        <Heading size="md">Groups and segmented controls</Heading>
        <div className="control-grid">
          <ButtonGroup attached size="sm">
            <Button size="sm" variant="subtle">Day</Button>
            <Button size="sm" variant="primary">Week</Button>
            <Button size="sm" variant="subtle">Month</Button>
          </ButtonGroup>
          <SegmentedControl
            aria-label="Density"
            value={density}
            onChange={setDensity}
            options={[
              { value: "compact", label: "Compact", icon: <Icon name="Minus" /> },
              { value: "standard", label: "Standard", icon: <Icon name="Columns" /> },
              { value: "comfortable", label: "Comfort", icon: <Icon name="Plus" /> }
            ]}
          />
          <SegmentedControl
            aria-label="View mode"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "table", label: "Table", icon: <Icon name="Columns" /> },
              { value: "list", label: "List", icon: <Icon name="DragHandle" /> },
              { value: "card", label: "Card", icon: <Icon name="Eye" /> }
            ]}
          />
        </div>
      </section>

      <section className="playground-grid two">
        <div className="playground-card" data-theme="dark">
          <Heading size="sm">Dark toolbar</Heading>
          <div className="compact-toolbar">
            <ToolbarButton icon={<Icon name="Search" />} label="Search" variant="subtle" />
            <ToolbarButton active icon={<Icon name="Filter" />} label="Filter" />
            <ToolbarButton aria-label="More" icon={<Icon name="MoreVertical" />} tooltip="More" />
          </div>
        </div>
        <div className="playground-card" data-theme="enterprise">
          <Heading size="sm">Enterprise actions</Heading>
          <div className="compact-toolbar">
            <ToolbarButton icon={<Icon name="Import" />} label="Import" />
            <ToolbarButton icon={<Icon name="Export" />} label="Export" />
            <ToolbarButton icon={<Icon name="Reset" />} label="Reset" variant="subtle" />
          </div>
        </div>
      </section>
    </div>
  );
}
