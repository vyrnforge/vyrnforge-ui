import type { ReactNode } from "react";
import { Badge, CodeText, PageHeader, Panel, Text } from "@vyrnforge/ui-components";
import { CodeBlock } from "./CodeBlock";
import { RelatedComponents } from "./RelatedComponents";
import { UsageGuidance } from "./UsageGuidance";

export type DemoStatus =
  | "stable"
  | "beta-stable"
  | "alpha-stable"
  | "experimental"
  | "candidate"
  | "planned"
  | "deprecated";

export type DemoPageProps = {
  title: string;
  description: string;
  packageName: "@vyrnforge/ui-core" | "@vyrnforge/ui-components" | "@vyrnforge/ui-data-grid";
  status: DemoStatus;
  importSnippet: string;
  children: ReactNode;
  usage?: string;
  avoid?: string;
  accessibility?: string;
  relatedComponents?: string[];
};

const statusVariant = {
  stable: "warning",
  "beta-stable": "success",
  "alpha-stable": "warning",
  experimental: "info",
  candidate: "warning",
  planned: "neutral",
  deprecated: "danger"
} as const;

function statusLabel(status: DemoStatus) {
  if (status === "stable") {
    return "Legacy stable — verification required";
  }

  return status;
}

export function DemoPage({
  title,
  description,
  packageName,
  status,
  importSnippet,
  children,
  usage,
  avoid,
  accessibility,
  relatedComponents
}: DemoPageProps) {
  return (
    <div className="vf-playground-demo-page">
      <PageHeader
        description={description}
        status={
          <div className="vf-playground-demo-page__badges">
            <Badge tone="subtle">{packageName}</Badge>
            <Badge variant={statusVariant[status]}>{statusLabel(status)}</Badge>
          </div>
        }
        title={title}
      />
      <Panel className="vf-playground-import" title="Import">
        <CodeBlock code={importSnippet} />
      </Panel>
      {children}
      <div className="vf-playground-demo-page__reference">
        <UsageGuidance accessibility={accessibility} avoidWhen={avoid} useWhen={usage} />
        <RelatedComponents components={relatedComponents} />
      </div>
      <Text className="vf-playground-demo-page__note" size="sm" tone="muted">
        Examples use documented public APIs only. <CodeText>{packageName}</CodeText> owns the behavior shown here.
      </Text>
    </div>
  );
}
