import { Caption, CodeText, Heading, Label, Text } from "@dravyn/ui-components";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";

export function TypographyPage() {
  return (
    <DemoPage
      accessibility="Preserve heading order and use semantic labels for associated controls."
      avoid="Avoid styling raw paragraphs and headings when a typography primitive already fits."
      description="Semantic text primitives for dense operational screens and reusable UI composition."
      importSnippet={'import { Heading, Text, Label, Caption, CodeText } from "@dravyn/ui-components";'}
      packageName="@dravyn/ui-components"
      relatedComponents={["PageHeader", "Field", "Badge"]}
      status="candidate"
      title="Typography"
      usage="Use the semantic component that matches the content's meaning, then choose its visual size or tone."
    >
      <DemoSection description="Use heading levels to keep the document outline intact." title="Text hierarchy">
        <DemoBlock
          code={'<Heading level={2} size="lg">Workspace</Heading>\n<Text tone="muted">Updated today</Text>'}
          preview={<div className="dv-playground-text-demo"><Heading level={2} size="lg">Heading large</Heading><Heading level={3} size="md">Heading medium</Heading><Heading level={4} size="sm">Heading small</Heading><Text>Default body text is tuned for dense product surfaces and predictable line height.</Text><Text size="sm">Small text supports compact metadata rows.</Text><Text tone="muted">Muted text supports helper copy.</Text><Text tone="strong">Strong text emphasizes a current selection.</Text></div>}
          title="Headings and body text"
        />
      </DemoSection>
      <DemoSection description="Use labels and captions for supporting context, never as a replacement for required information." title="Supporting text">
        <DemoBlock
          code={'<Label htmlFor="workspace">Workspace name</Label>\n<Caption>Shown to everyone in the organization.</Caption>\n<CodeText>--dv-primary</CodeText>'}
          preview={<div className="dv-playground-text-demo"><Label>Label primitive</Label><Caption>Caption text supports hints, timestamps, and quiet helper copy.</Caption><CodeText>--dv-primary: #2563eb;</CodeText><p className="dv-truncate dv-playground-truncate-demo">Truncated utility text keeps long labels contained in fixed-width operational layouts.</p></div>}
          title="Labels, captions, and code"
        />
      </DemoSection>
    </DemoPage>
  );
}
