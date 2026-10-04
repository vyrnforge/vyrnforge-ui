import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Heading,
  InlineMessage,
  SearchInput,
  Select,
  Switch,
  Tabs,
  Text,
  TextInput,
} from "@vyrnforge/ui-components";
import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import { referenceModel } from "./docsContext";

function componentHref(componentId: string) {
  return `#${getReferenceRecordRoute(referenceModel, "components", componentId)}`;
}

function ShowcaseSection({
  children,
  description,
  links,
  title,
}: {
  children: ReactNode;
  description: string;
  links: Array<{ id: string; label: string }>;
  title: string;
}) {
  return (
    <section className="vf-docs-component-showcase__section">
      <div className="vf-docs-component-showcase__heading">
        <div>
          <Heading level={3} size="md">
            {title}
          </Heading>
          <Text tone="muted">{description}</Text>
        </div>
        <div className="vf-docs-component-showcase__links">
          {links.map((link) => (
            <a href={componentHref(link.id)} key={link.id}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="vf-docs-component-showcase__stage">{children}</div>
    </section>
  );
}

export function ReferenceComponentGallery() {
  const [enabled, setEnabled] = useState(true);
  const [tab, setTab] = useState("overview");

  return (
    <div className="vf-docs-component-showcase">
      <section className="vf-docs-component-showcase__intro">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Live component gallery
          </Text>
          <Heading level={3} size="md">
            Start from behavior and composition, then open the API.
          </Heading>
          <Text tone="muted">
            These are the shipped VyrnForge React components rendered directly
            in Reference. The full generated directory remains below for exact
            contracts and framework surfaces.
          </Text>
        </div>
      </section>

      <div className="vf-docs-component-showcase__grid">
        <ShowcaseSection
          description="Primary, secondary, destructive, and lightweight actions share one Button contract."
          links={[
            { id: "button", label: "Button" },
            { id: "button-group", label: "Button Group" },
            { id: "icon-button", label: "Icon Button" },
          ]}
          title="Actions"
        >
          <div className="vf-docs-specimen-row">
            <Button variant="primary">Create</Button>
            <Button variant="default">Continue</Button>
            <Button variant="subtle">Details</Button>
            <Button variant="ghost">Dismiss</Button>
            <Button variant="danger">Delete</Button>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          description="Form controls share sizing, focus, validation, and density foundations."
          links={[
            { id: "text-input", label: "Text Input" },
            { id: "select", label: "Select" },
            { id: "switch", label: "Switch" },
            { id: "search-input", label: "Search" },
          ]}
          title="Inputs"
        >
          <div className="vf-docs-specimen-form">
            <TextInput
              aria-label="Workspace name"
              defaultValue="Revenue Ops"
            />
            <Select
              aria-label="Region"
              defaultValue="apac"
              options={[
                { label: "APAC", value: "apac" },
                { label: "EMEA", value: "emea" },
                { label: "AMER", value: "amer" },
              ]}
            />
            <SearchInput
              aria-label="Search resources"
              placeholder="Search"
            />
            <Switch
              checked={enabled}
              description="Applies to new workspaces."
              label="Enable review workflow"
              onCheckedChange={setEnabled}
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          description="Status and feedback primitives communicate meaning without application-specific state ownership."
          links={[
            { id: "badge", label: "Badge" },
            { id: "inline-message", label: "Inline Message" },
            { id: "empty-state", label: "Empty State" },
          ]}
          title="Status & feedback"
        >
          <div className="vf-docs-specimen-stack">
            <div className="vf-docs-specimen-row">
              <Badge variant="success">Healthy</Badge>
              <Badge variant="warning">Review</Badge>
              <Badge variant="danger">Blocked</Badge>
              <Badge variant="info">In progress</Badge>
            </div>
            <InlineMessage title="Changes saved" variant="success">
              Workspace defaults are now active.
            </InlineMessage>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          description="Navigation components expose controlled selection while applications keep routing and business state."
          links={[
            { id: "tabs", label: "Tabs" },
            { id: "side-nav", label: "Side Nav" },
            { id: "breadcrumbs", label: "Breadcrumbs" },
          ]}
          title="Navigation"
        >
          <Tabs
            items={[
              {
                id: "overview",
                label: "Overview",
                content: "Workspace summary",
              },
              {
                id: "activity",
                label: "Activity",
                content: "Recent activity",
              },
              {
                id: "settings",
                label: "Settings",
                content: "Workspace settings",
              },
            ]}
            onValueChange={setTab}
            value={tab}
          />
        </ShowcaseSection>
      </div>
    </div>
  );
}
