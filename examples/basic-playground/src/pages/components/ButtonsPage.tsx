import { Button, ButtonGroup, Icon, IconButton } from "@dravyn/ui-components";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";
import { PropsTable } from "../../components/PropsTable";

const variants = ["default", "primary", "danger", "ghost", "subtle"] as const;
const sizes = ["sm", "md", "lg"] as const;

export function ButtonsPage() {
  return (
    <DemoPage
      accessibility="Use a visible text label for business actions. Icon-only actions need an aria-label."
      avoid="Avoid Button for repeated icon-only utilities; use IconButton or ToolbarButton."
      description="Text actions for page commands, form submission, and clear workflow choices."
      importSnippet={'import { Button, ButtonGroup } from "@dravyn/ui-components";'}
      packageName="@dravyn/ui-components"
      relatedComponents={["IconButton", "ToolbarButton", "SegmentedControl"]}
      status="candidate"
      title="Button"
      usage="Use Button for clear business actions such as save, create, confirm, or retry."
    >
      <DemoSection description="Choose the visual weight that matches the action's importance." title="Variants">
        <DemoBlock
          code={'<Button variant="primary">Create workspace</Button>\n<Button variant="subtle">Cancel</Button>\n<Button variant="danger">Delete</Button>'}
          preview={<div className="dv-playground-control-grid">{variants.map((variant) => <Button key={variant} variant={variant}>{variant}</Button>)}<Button disabled>disabled</Button><Button loading variant="primary">loading</Button></div>}
          title="Action states"
        />
      </DemoSection>
      <DemoSection description="Keep icon-only controls compact and labelled." title="Sizing and composition">
        <DemoBlock
          code={'<Button size="sm" variant="primary">Save</Button>\n<IconButton aria-label="Refresh"><Icon name="Refresh" /></IconButton>'}
          preview={<div className="dv-playground-control-grid">{sizes.map((size) => <Button key={size} size={size} variant="primary">{size}</Button>)}<IconButton aria-label="Add" title="Add"><Icon name="Plus" /></IconButton><IconButton aria-label="Refresh" title="Refresh" variant="subtle"><Icon name="Refresh" /></IconButton><IconButton aria-label="Delete" title="Delete" variant="danger"><Icon name="Delete" /></IconButton></div>}
          title="Sizes and icon actions"
        />
        <DemoBlock
          code={'<ButtonGroup attached>\n  <Button variant="subtle">Day</Button>\n  <Button variant="primary">Week</Button>\n  <Button variant="subtle">Month</Button>\n</ButtonGroup>'}
          preview={<ButtonGroup attached><Button variant="subtle">Day</Button><Button variant="primary">Week</Button><Button variant="subtle">Month</Button></ButtonGroup>}
          title="Button group"
        />
      </DemoSection>
      <DemoSection description="The common visual and interaction options." title="Reference">
        <PropsTable rows={[{ name: "variant", type: '"default" | "primary" | "danger" | "ghost" | "subtle"', defaultValue: '"default"', description: "Visual action emphasis." }, { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Control density." }, { name: "loading", type: "boolean", defaultValue: "false", description: "Shows busy feedback and prevents repeat actions." }]} />
      </DemoSection>
    </DemoPage>
  );
}
