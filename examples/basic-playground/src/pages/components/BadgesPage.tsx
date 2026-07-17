import { Badge, StatusBadge } from "@vyrnforge/ui-components";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";

const variants = ["neutral", "success", "warning", "danger", "info"] as const;

export function BadgesPage() {
  return (
    <DemoPage
      accessibility="Do not use badge color as the sole way to communicate a status; keep the label meaningful."
      avoid="Avoid badges for primary actions or long prose."
      description="Compact labels for status, metadata, and categorization in dense product surfaces."
      importSnippet={'import { Badge, StatusBadge } from "@vyrnforge/ui-components";'}
      packageName="@vyrnforge/ui-components"
      relatedComponents={["Alert", "InlineMessage", "Text"]}
      status="candidate"
      title="Badge"
      usage="Use for small, scannable state labels and supplementary metadata."
    >
      <DemoSection description="Neutral and semantic status treatments." title="Variants">
        <DemoBlock
          code={'<Badge variant="success">Active</Badge>\n<Badge variant="warning">Pending</Badge>\n<Badge variant="danger">Blocked</Badge>'}
          preview={<div className="vf-playground-badge-row">{variants.map((variant) => <Badge key={variant} variant={variant}>{variant}</Badge>)}{variants.map((variant) => <Badge key={`${variant}-solid`} tone="solid" variant={variant}>{variant} solid</Badge>)}</div>}
          title="Status badges"
        />
        <DemoBlock
          code={'<StatusBadge status="active" />\n<StatusBadge status="pending" />'}
          preview={<div className="vf-playground-badge-row"><StatusBadge status="active" /><StatusBadge status="pending" /><StatusBadge status="error" label="blocked" /><StatusBadge status="custom" label="custom mapped" /></div>}
          title="Mapped product statuses"
        />
      </DemoSection>
    </DemoPage>
  );
}
