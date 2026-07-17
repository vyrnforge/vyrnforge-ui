import { Badge, Card, Heading, Text } from "@vyrnforge/ui-components";

type ComponentStatus = "current" | "planned" | "experimental";

type ComponentItem = {
  name: string;
  packageName: string;
  status: ComponentStatus;
  purpose: string;
  notes: string;
};

type ComponentArea = {
  area: string;
  components: ComponentItem[];
};

const componentAreas: ComponentArea[] = [
  {
    area: "Foundation",
    components: [
      {
        name: "Theme tokens",
        packageName: "@vyrnforge/ui-core",
        status: "current",
        purpose: "Shared design variables for color, spacing, typography, radius, shadow, and density.",
        notes: "Source of truth: docs/packages/ui-core.md."
      },
      {
        name: "Utilities",
        packageName: "@vyrnforge/ui-core",
        status: "current",
        purpose: "Small shared utility classes such as text, focus, truncation, and screen-reader helpers.",
        notes: "Keep dependency-free and stable."
      }
    ]
  },
  {
    area: "Actions",
    components: [
      {
        name: "Button",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Primary, secondary, subtle, and utility actions.",
        notes: "Use for business actions with visible text."
      },
      {
        name: "IconButton / ToolbarButton",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Compact repeated utility actions.",
        notes: "Icon-only controls require accessible labels."
      },
      {
        name: "SegmentedControl",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Small mutually exclusive mode selection.",
        notes: "Useful for density, view mode, and theme previews."
      }
    ]
  },
  {
    area: "Typography",
    components: [
      {
        name: "Heading / Text / Label / Caption / CodeText",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Consistent semantic text primitives.",
        notes: "Use package typography before custom heading/text classes."
      }
    ]
  },
  {
    area: "Forms",
    components: [
      {
        name: "Field / TextInput / SearchInput / Select / Checkbox / Textarea",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Native-first form controls and field composition.",
        notes: "Radio, Switch, NumberInput, DateInput, and MultiSelect are planned."
      }
    ]
  },
  {
    area: "Feedback",
    components: [
      {
        name: "Badge / StatusBadge / Alert / InlineMessage",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Compact status and message surfaces.",
        notes: "Use semantic tone variants."
      },
      {
        name: "EmptyState / ErrorState / LoadingState / Skeleton",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Common stateful content placeholders.",
        notes: "Skeleton respects reduced motion settings."
      }
    ]
  },
  {
    area: "Layout",
    components: [
      {
        name: "Card / Panel / Stack / Inline / Section",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Reusable layout primitives for dense application UI.",
        notes: "AppShell, Page, PageHeader, and navigation are planned."
      }
    ]
  },
  {
    area: "Overlays",
    components: [
      {
        name: "Popover / Menu / Dropdown / Tooltip / Dialog / Drawer / ConfirmDialog",
        packageName: "@vyrnforge/ui-components",
        status: "current",
        purpose: "Native-first overlay interactions.",
        notes: "Portal, robust collision handling, and focus-trap hardening remain roadmap work."
      }
    ]
  },
  {
    area: "Data Grid",
    components: [
      {
        name: "UniversalDataGrid",
        packageName: "@vyrnforge/ui-data-grid",
        status: "current",
        purpose: "Specialized enterprise data-management grid.",
        notes: "Server mode, saved views, advanced filters, and virtualization remain planned phases."
      }
    ]
  },
  {
    area: "Navigation planned",
    components: [
      {
        name: "Tabs / Breadcrumbs / SideNav / TopNav / AppShell",
        packageName: "@vyrnforge/ui-components",
        status: "planned",
        purpose: "Complete portal and admin app navigation.",
        notes: "Prioritized in the master roadmap before deep grid-only work."
      }
    ]
  },
  {
    area: "Data display planned",
    components: [
      {
        name: "DescriptionList / KeyValueList / PropertyTable / ResourceList / Timeline / ActivityLog",
        packageName: "@vyrnforge/ui-components",
        status: "planned",
        purpose: "Read-only enterprise data display surfaces.",
        notes: "Should follow repeated real product needs."
      }
    ]
  }
];

function statusVariant(status: ComponentStatus) {
  if (status === "current") {
    return "success";
  }

  if (status === "experimental") {
    return "warning";
  }

  return "info";
}

export function ComponentReferencePage() {
  return (
    <div className="vf-docs-reference">
      {componentAreas.map((area) => (
        <Card className="vf-docs-reference__section" key={area.area} padding="lg">
          <Heading level={3} size="md">
            {area.area}
          </Heading>
          <div className="vf-docs-reference__grid">
            {area.components.map((component) => (
              <Card className="vf-docs-reference-card" key={component.name} padding="md">
                <div className="vf-docs-reference-card__header">
                  <div>
                    <Heading level={4} size="sm">
                      {component.name}
                    </Heading>
                    <code>{component.packageName}</code>
                  </div>
                  <Badge
                    size="sm"
                    tone="subtle"
                    variant={statusVariant(component.status)}
                  >
                    {component.status}
                  </Badge>
                </div>
                <Text>{component.purpose}</Text>
                <Text tone="muted" size="sm">
                  {component.notes}
                </Text>
              </Card>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
