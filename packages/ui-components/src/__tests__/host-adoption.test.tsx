import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AppShell,
  Caption,
  Card,
  CodeText,
  Heading,
  Inline,
  Label,
  Page,
  PageHeader,
  PageToolbar,
  Panel,
  Section,
  Stack,
  Text,
} from "../index";

describe("shared native-host adoption", () => {
  it("preserves React typography semantic native tags and native attributes", () => {
    const markup = renderToStaticMarkup(
      <>
        <Text as="span" data-contract="text">
          Text
        </Text>
        <Heading level={4} data-contract="heading">
          Heading
        </Heading>
        <Label htmlFor="field">Label</Label>
        <Caption as="p">Caption</Caption>
        <CodeText as="span">Code</CodeText>
      </>,
    );

    expect(markup).toContain(
      '<span data-contract="text" class="vf-text vf-text--md">Text</span>',
    );
    expect(markup).toContain("<h4");
    expect(markup).toContain('data-contract="heading"');
    expect(markup).toContain('for="field"');
    expect(markup).toContain('<p class="vf-caption');
    expect(markup).toContain('<span class="vf-code-text');
    expect(markup).not.toContain("<vf-text");
  });

  it("preserves native div roots and layout modifier classes", () => {
    const markup = renderToStaticMarkup(
      <>
        <Card padding="lg" variant="elevated">
          Card
        </Card>
        <Stack align="center" gap="sm" justify="between">
          Stack
        </Stack>
        <Inline gap="md" justify="end" wrap>
          Inline
        </Inline>
      </>,
    );

    expect(markup).toContain(
      '<div class="vf-card vf-card--elevated vf-card--padding-lg">Card</div>',
    );
    expect(markup).toContain(
      "vf-stack vf-stack--gap-sm vf-stack--align-center vf-stack--justify-between",
    );
    expect(markup).toContain(
      "vf-inline vf-inline--gap-md vf-inline--align-center vf-inline--justify-end vf-inline--wrap",
    );
    expect(markup).not.toContain("<vf-card");
  });

  it("preserves rich layout region classes and semantic wrappers", () => {
    const markup = renderToStaticMarkup(
      <>
        <Panel
          actions={<button>Panel action</button>}
          description="Panel description"
          title="Panel title"
        >
          Panel body
        </Panel>
        <Section
          actions={<button>Section action</button>}
          description="Section description"
          title="Section title"
        >
          Section body
        </Section>
        <AppShell
          footer={<span>Footer</span>}
          header={<span>Header</span>}
          sidebar={<span>Sidebar</span>}
        >
          Content
        </AppShell>
        <Page
          title="Page title"
          toolbar={<span>Toolbar</span>}
        >
          Page body
        </Page>
        <PageHeader
          actions={<button>Action</button>}
          breadcrumbs={<span>Breadcrumbs</span>}
          metadata={<span>Metadata</span>}
          status={<span>Status</span>}
          title="Header title"
        />
        <PageToolbar left={<span>Left</span>} right={<span>Right</span>} />
      </>,
    );

    expect(markup).toContain('<section class="vf-panel">');
    expect(markup).toContain('class="vf-panel__actions"');
    expect(markup).toContain('<section class="vf-section">');
    expect(markup).toContain('class="vf-section__actions"');
    expect(markup).toContain('<header class="vf-app-shell__header">');
    expect(markup).toContain('<aside class="vf-app-shell__sidebar">');
    expect(markup).toContain('class="vf-app-shell__content"');
    expect(markup).toContain(
      '<main class="vf-page vf-page--max-lg vf-page--standard">',
    );
    expect(markup).toContain('class="vf-page__toolbar"');
    expect(markup).toContain('<header class="vf-page-header">');
    expect(markup).toContain('class="vf-page-header__breadcrumbs"');
    expect(markup).toContain('class="vf-page-header__metadata"');
    expect(markup).toContain(
      '<div class="vf-page-toolbar vf-page-toolbar--standard"',
    );
    expect(markup).toContain('class="vf-page-toolbar__right"');
  });
});
