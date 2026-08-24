from pathlib import Path
import re
import textwrap

ROOT = Path(__file__).resolve().parents[1]


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(textwrap.dedent(content).lstrip(), encoding="utf-8")


def replace(path: str, old: str, new: str) -> None:
    target = ROOT / path
    content = target.read_text(encoding="utf-8")
    if old not in content:
        raise RuntimeError(f"missing marker in {path}: {old[:80]!r}")
    target.write_text(content.replace(old, new), encoding="utf-8")


# Human-facing component reference now reads canonical generated knowledge.
write(
    "examples/basic-playground/src/components/ComponentDemoPage.tsx",
    r'''
    import type { ReactNode } from "react";
    import {
      Badge,
      CodeText,
      PageHeader,
      Panel,
      Tabs,
      Text,
      type TabItem
    } from "@vyrnforge/ui-components";
    import consumerKnowledgeRaw from "../../../../docs/generated/consumer-knowledge.json?raw";
    import { CodeBlock } from "./CodeBlock";
    import { PageOutline, type PageOutlineItem } from "./PageOutline";
    import { PropsTable, type PropsTableRow } from "./PropsTable";

    export type ComponentPageSection = {
      id: string;
      label: string;
      title?: string;
      children: ReactNode;
    };

    export type RelatedComponentLink = {
      id: string;
      name: string;
      description: string;
    };

    type FrameworkUsage = {
      label: string;
      status: string;
      package: string | null;
      setup: string;
      example: string;
      note: string;
    };

    type CanonicalComponentKnowledge = {
      id: string;
      displayName: string;
      package: string | null;
      category: string;
      maturity: string;
      availability: string;
      purpose: string;
      guidance: {
        useWhen: string | null;
        avoidWhen: string | null;
        aiUsageNotes: string | null;
        relatedComponents: string[];
      };
      accessibilityNotes: string | null;
      knownLimitations: string[];
      frameworks: Record<"react" | "native-html" | "angular" | "vue", FrameworkUsage>;
      contract: { accessibility?: string[] } | null;
    };

    type ConsumerKnowledge = {
      components: CanonicalComponentKnowledge[];
    };

    export type ComponentDemoPageProps = {
      title: string;
      description?: string;
      packageName?: "@vyrnforge/ui-components" | "@vyrnforge/ui-data-grid";
      importCode: string;
      sections: ComponentPageSection[];
      useWhen?: string[];
      avoidWhen?: string[];
      accessibility?: string[];
      props?: PropsTableRow[];
      relatedComponents?: RelatedComponentLink[];
    };

    const consumerKnowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
    export const canonicalKnowledge = consumerKnowledge.components;

    const frameworkOrder = [
      { id: "react", label: "React" },
      { id: "native-html", label: "Native HTML" },
      { id: "angular", label: "Angular" },
      { id: "vue", label: "Vue" }
    ] as const;

    const maturityVariant = {
      planned: "neutral",
      experimental: "info",
      "alpha-stable": "warning",
      "beta-stable": "success",
      stable: "success",
      deprecated: "danger"
    } as const;

    function normalizeName(value: string) {
      return value.toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    function getCanonicalKnowledge(title: string) {
      const normalized = normalizeName(title);
      return canonicalKnowledge.find(
        (component) => normalizeName(component.displayName) === normalized
      );
    }

    function GuidanceList({ title, items }: { title: string; items?: string[] }) {
      if (!items || items.length === 0) return null;
      return (
        <div className="vf-playground-guidance-list">
          <h3>{title}</h3>
          <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      );
    }

    function FrameworkUsagePanel({ usage }: { usage: FrameworkUsage }) {
      return (
        <div className="vf-playground-framework-usage">
          <div className="vf-playground-demo-page__badges">
            <Badge tone="subtle">{usage.status}</Badge>
            {usage.package && <Badge tone="subtle">{usage.package}</Badge>}
          </div>
          {usage.setup && <CodeBlock code={usage.setup} />}
          {usage.example && <CodeBlock code={usage.example} />}
          <Text size="sm" tone="muted">{usage.note}</Text>
        </div>
      );
    }

    function frameworkTabs(component: CanonicalComponentKnowledge): TabItem[] {
      return frameworkOrder.map(({ id, label }) => ({
        id,
        label,
        content: <FrameworkUsagePanel usage={component.frameworks[id]} />
      }));
    }

    export function ComponentDemoPage({
      title,
      description,
      packageName,
      importCode,
      sections,
      useWhen,
      avoidWhen,
      accessibility,
      props,
      relatedComponents
    }: ComponentDemoPageProps) {
      const canonical = getCanonicalKnowledge(title);
      const canonicalUseWhen = canonical?.guidance.useWhen ? [canonical.guidance.useWhen] : useWhen;
      const canonicalAvoidWhen = canonical?.guidance.avoidWhen ? [canonical.guidance.avoidWhen] : avoidWhen;
      const canonicalAccessibility = canonical
        ? [
            ...(canonical.accessibilityNotes ? [canonical.accessibilityNotes] : []),
            ...(canonical.contract?.accessibility ?? [])
          ]
        : accessibility;
      const outlineItems: PageOutlineItem[] = [
        { id: "overview", label: "Overview" },
        { id: "import", label: "Import" },
        ...(canonical ? [{ id: "framework-usage", label: "Framework usage" }] : []),
        ...sections.map(({ id, label }) => ({ id, label })),
        ...(canonicalUseWhen?.length || canonicalAvoidWhen?.length ? [{ id: "usage-guidance", label: "Usage guidance" }] : []),
        ...(props?.length ? [{ id: "api-reference", label: "API reference" }] : []),
        ...(canonicalAccessibility?.length ? [{ id: "accessibility", label: "Accessibility" }] : []),
        ...(relatedComponents?.length ? [{ id: "related-components", label: "Related components" }] : [])
      ];
      const resolvedPackage = canonical?.package ?? packageName;
      const maturity = canonical?.maturity as keyof typeof maturityVariant | undefined;

      return (
        <div className="vf-playground-reference-layout">
          <div className="vf-playground-reference-content">
            <section className="vf-playground-section" id="overview">
              <PageHeader
                description={canonical?.purpose || description}
                status={
                  <div className="vf-playground-demo-page__badges">
                    {resolvedPackage && <Badge tone="subtle">{resolvedPackage}</Badge>}
                    {canonical && <Badge variant="success" tone="subtle">{canonical.availability}</Badge>}
                    {maturity && <Badge variant={maturityVariant[maturity] ?? "neutral"}>{maturity}</Badge>}
                  </div>
                }
                title={title}
              />
            </section>
            <section className="vf-playground-section" id="import">
              <Panel title="Import"><CodeBlock code={importCode} /></Panel>
            </section>
            {canonical && (
              <section className="vf-playground-section" id="framework-usage">
                <Panel title="Framework usage">
                  <Text tone="muted">
                    Current support and setup are generated from canonical VyrnForge framework metadata.
                  </Text>
                  <Tabs
                    aria-label={`${title} framework usage`}
                    items={frameworkTabs(canonical)}
                    defaultValue="react"
                    size="sm"
                  />
                </Panel>
              </section>
            )}
            {sections.map((section) => (
              <section className="vf-playground-section" id={section.id} key={section.id}>
                {section.title && <h2 className="vf-playground-section__title">{section.title}</h2>}
                {section.children}
              </section>
            ))}
            {(canonicalUseWhen?.length || canonicalAvoidWhen?.length) && (
              <section className="vf-playground-section" id="usage-guidance">
                <Panel className="vf-playground-guidance" title="Usage guidance">
                  <GuidanceList items={canonicalUseWhen} title="Use when" />
                  <GuidanceList items={canonicalAvoidWhen} title="Avoid when" />
                </Panel>
              </section>
            )}
            {props && props.length > 0 && (
              <section className="vf-playground-section" id="api-reference">
                <Panel title="API reference"><PropsTable rows={props} /></Panel>
              </section>
            )}
            {canonicalAccessibility && canonicalAccessibility.length > 0 && (
              <section className="vf-playground-section" id="accessibility">
                <Panel title="Accessibility"><GuidanceList items={canonicalAccessibility} title="Considerations" /></Panel>
              </section>
            )}
            {relatedComponents && relatedComponents.length > 0 && (
              <section className="vf-playground-section" id="related-components">
                <Panel title="Related components">
                  <ul className="vf-playground-related-links">
                    {relatedComponents.map((component) => <li key={component.id}><a href={`#${component.id}`}><CodeText>{component.name}</CodeText><Text tone="muted">{component.description}</Text></a></li>)}
                  </ul>
                </Panel>
              </section>
            )}
          </div>
          <PageOutline items={outlineItems} />
        </div>
      );
    }
    ''',
)

# Maturity is generated. Keep verified human examples, but remove duplicated status claims.
reference_dir = ROOT / "examples/basic-playground/src/pages/reference"
for target in reference_dir.glob("*.tsx"):
    content = target.read_text(encoding="utf-8")
    content = re.sub(r'\s+status="(?:stable|beta-stable|alpha-stable|experimental|planned|deprecated)"', "", content)
    target.write_text(content, encoding="utf-8")

# Give the old sprint-coded reference source a durable semantic name.
old_controls = reference_dir / "S3B1ComponentPages.tsx"
new_controls = reference_dir / "ControlComponentPages.tsx"
if old_controls.exists():
    old_controls.rename(new_controls)
replace(
    "examples/basic-playground/src/app/routes.ts",
    'from "../pages/reference/S3B1ComponentPages";',
    'from "../pages/reference/ControlComponentPages";',
)

# Public playground information architecture. Internal QA remains reachable for tests but hidden from normal navigation.
routes_path = ROOT / "examples/basic-playground/src/app/routes.ts"
routes = routes_path.read_text(encoding="utf-8")
routes = 'import consumerKnowledgeRaw from "../../../../docs/generated/consumer-knowledge.json?raw";\n' + routes
routes = routes.replace('| "Data Grid"\n    | "Patterns"\n    | "Quality";', '| "Patterns"\n    | "Advanced Modules"\n    | "Internal";')
routes = routes.replace('  gallery?: boolean;\n', '  gallery?: boolean;\n  visibility?: "public" | "internal";\n')
routes = routes.replace('    group: "Data Grid",', '    group: "Advanced Modules",')
routes = routes.replace('    group: "Quality",', '    group: "Internal",\n    visibility: "internal",')
# Overlay stress is an engineering torture surface, not a public pattern.
routes = routes.replace('    id: "overlay-stress",\n    label: "Overlay Stress Test",', '    id: "overlay-stress",\n    label: "Overlay Stress Test",')
routes = routes.replace('    description:\n      "Nested portal, focus, dismissal, scroll, and z-index exercise.",\n    group: "Patterns",\n    Component: OverlayStressPage,', '    description:\n      "Nested portal, focus, dismissal, scroll, and z-index engineering exercise.",\n    group: "Internal",\n    visibility: "internal",\n    Component: OverlayStressPage,')
routes = routes.replace('"Shared dv tokens for color, surfaces, typography, spacing, and status."', '"Shared vf tokens for color, surfaces, typography, spacing, and status."')
routes = routes.replace('"Global dv overrides, local scopes, and grid-only udg overrides."', '"Global vf overrides, local scopes, and grid-only udg overrides."')
routes = routes.replace('export const routes: PlaygroundRoute[] = [', '''const consumerKnowledge = JSON.parse(consumerKnowledgeRaw) as {
  patterns: Array<{ id: string; purpose: string }>;
};

function patternDescription(id: string, fallback: string) {
  return consumerKnowledge.patterns.find((pattern) => pattern.id === id)?.purpose ?? fallback;
}

export const routes: PlaygroundRoute[] = [''')
pattern_replacements = {
    '"Compact enterprise lists with metadata, actions, and badges."': 'patternDescription("resource-list", "Compact resource lists with metadata and actions.")',
    '"Header, metadata, status, key-value sections, and actions."': 'patternDescription("detail", "Entity detail composition.")',
    '"Sectioned settings with checkboxes and explanatory text."': 'patternDescription("settings", "Sectioned settings composition.")',
    '"Fields, validation, disabled controls, and submission actions."': 'patternDescription("form", "General application form composition.")',
    '"Search, select, native date range, and filter actions."': 'patternDescription("filter-form", "Operational filter composition.")',
    '"Bounded dual-list assignment flows with TransferList."': 'patternDescription("assignment-patterns", "Bounded assignment flows.")',
    '"Full-page feedback states for enterprise workflows."': 'patternDescription("empty-error-loading", "Route-level feedback states.")',
}
for old, new in pattern_replacements.items():
    routes = routes.replace(old, new)
routes = routes.replace('    description:\n      "A complete admin app frame using AppShell, TopNav, SideNav, PageHeader, and PageToolbar.",', '    description: patternDescription("admin-shell", "Admin workspace composition."),')
routes = routes.replace('    description:\n      "A customer-facing portal frame with enterprise theme, breadcrumbs, and tabs.",', '    description: patternDescription("customer-portal-shell", "Customer portal composition."),')
routes = routes.replace('export const routeGroups = [\n  "Overview",\n  "Foundations",\n  "Components",\n  "Data Grid",\n  "Patterns",\n  "Quality",\n] as const;', 'export const routeGroups = [\n  "Overview",\n  "Foundations",\n  "Components",\n  "Patterns",\n  "Advanced Modules",\n  "Internal",\n] as const;')
routes_path.write_text(routes, encoding="utf-8")

replace(
    "examples/basic-playground/src/app/PlaygroundNav.tsx",
    '    const groupRoutes = routes.filter((route) => route.group === group);',
    '    const groupRoutes = routes.filter(\n      (route) => route.group === group && route.visibility !== "internal"\n    );',
)

# Public shell copy reflects the actual role of this application.
replace("examples/basic-playground/src/app/PlaygroundShell.tsx", '<span className="vf-playground-brand__mark">D</span>', '<span className="vf-playground-brand__mark">V</span>')
replace("examples/basic-playground/src/app/PlaygroundShell.tsx", '<Badge tone="subtle">native-first</Badge>', '<Badge tone="subtle">developer playground</Badge>')
replace("examples/basic-playground/src/app/PlaygroundShell.tsx", '<Badge variant="success">usage lab</Badge>', '<Badge variant="success">explore & build</Badge>')
for page in ["AdminShellPage.tsx", "CustomerPortalShellPage.tsx"]:
    replace(f"examples/basic-playground/src/pages/patterns/{page}", '<span className="vf-playground-brand__mark">D</span>', '<span className="vf-playground-brand__mark">V</span>')

# Durable token terminology.
for page in [
    "examples/basic-playground/src/pages/core/ThemeTokensPage.tsx",
    "examples/basic-playground/src/pages/core/CssOverridePage.tsx",
]:
    target = ROOT / page
    content = target.read_text(encoding="utf-8").replace("dv token", "vf token").replace("dv override", "vf override").replace("udg variables", "grid-specific udg variables")
    target.write_text(content, encoding="utf-8")

# Internal quality surface keeps useful QA coverage but drops retired audit identity.
quality = ROOT / "examples/basic-playground/src/pages/quality/ComponentMatrixPage.tsx"
quality.write_text(quality.read_text(encoding="utf-8").replace('<Badge variant="info">Q1</Badge>', '<Badge variant="info">internal QA</Badge>'), encoding="utf-8")

# Delete the superseded, unwired category-page system and its private helpers.
for path in [
    "examples/basic-playground/src/pages/components/ActionsPage.tsx",
    "examples/basic-playground/src/pages/components/BadgesPage.tsx",
    "examples/basic-playground/src/pages/components/ButtonsPage.tsx",
    "examples/basic-playground/src/pages/components/InputsPage.tsx",
    "examples/basic-playground/src/pages/components/LayoutPage.tsx",
    "examples/basic-playground/src/pages/components/NavigationPage.tsx",
    "examples/basic-playground/src/pages/components/OverlaysPage.tsx",
    "examples/basic-playground/src/pages/components/StatesPage.tsx",
    "examples/basic-playground/src/pages/components/TypographyPage.tsx",
    "examples/basic-playground/src/components/DemoBlock.tsx",
    "examples/basic-playground/src/components/DemoExample.tsx",
    "examples/basic-playground/src/components/DemoPage.tsx",
    "examples/basic-playground/src/components/DemoSection.tsx",
    "examples/basic-playground/src/components/RelatedComponents.tsx",
    "examples/basic-playground/src/components/UsageGuidance.tsx",
]:
    target = ROOT / path
    if target.exists():
        target.unlink()

# Outcome-oriented playground landing page generated from the shared knowledge projection.
write(
    "examples/basic-playground/src/pages/overview/OverviewPage.tsx",
    r'''
    import { Badge, Button, Card, Heading, Inline, Stack, Text } from "@vyrnforge/ui-components";
    import consumerKnowledgeRaw from "../../../../../docs/generated/consumer-knowledge.json?raw";

    type ConsumerKnowledge = {
      packages: Array<{ name: string; purpose: string; releaseTrack: string | null; runtime: string | null }>;
      frameworks: Array<{ id: string; supportLevel: string; renderer: string }>;
      patterns: Array<{ id: string; displayName: string; purpose: string; playgroundRoute: string }>;
    };

    const knowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
    const featuredPatterns = knowledge.patterns.filter((pattern) =>
      ["settings", "form", "resource-list", "detail", "admin-shell", "customer-portal-shell"].includes(pattern.id)
    );

    export function OverviewPage() {
      return (
        <Stack gap="lg">
          <section className="vf-playground-panel vf-playground-overview-hero">
            <Stack gap="md">
              <Badge variant="info">VyrnForge UI</Badge>
              <Heading size="lg">Build application UI, not isolated demos</Heading>
              <Text tone="muted">
                Explore reusable components, application patterns, shared foundations, and optional advanced modules. Examples use public VyrnForge APIs and keep business state in the consuming application.
              </Text>
              <Inline gap="sm" wrap>
                <Button as="a" href="#/settings" variant="primary">Explore a settings workflow</Button>
                <Button as="a" href="#/components/actions/button" variant="subtle">Browse components</Button>
              </Inline>
            </Stack>
          </section>

          <section>
            <Heading size="md">Build by outcome</Heading>
            <Text tone="muted">Start from a reusable application composition, then drill into the components it uses.</Text>
            <div className="vf-playground-grid vf-playground-grid--three">
              {featuredPatterns.map((pattern) => (
                <Card key={pattern.id} padding="md">
                  <Stack gap="sm">
                    <Heading size="sm">{pattern.displayName}</Heading>
                    <Text tone="muted">{pattern.purpose}</Text>
                    <a href={`#${pattern.playgroundRoute}`}>Open pattern</a>
                  </Stack>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Heading size="md">Framework surfaces</Heading>
            <Text tone="muted">Support labels come from canonical multi-framework metadata rather than playground copy.</Text>
            <div className="vf-playground-grid vf-playground-grid--four">
              {knowledge.frameworks.map((framework) => (
                <Card key={framework.id} padding="md">
                  <Stack gap="xs">
                    <Heading size="sm">{framework.id}</Heading>
                    <Badge tone="subtle">{framework.supportLevel}</Badge>
                    <Text size="sm" tone="muted">{framework.renderer}</Text>
                  </Stack>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Heading size="md">Package model</Heading>
            <Text tone="muted">The playground is broader than the grid: shared foundations, renderers, and advanced modules have separate responsibilities and release tracks.</Text>
            <div className="vf-playground-grid vf-playground-grid--three">
              {knowledge.packages.map((packageEntry) => (
                <Card key={packageEntry.name} padding="md">
                  <Stack gap="xs">
                    <Heading size="sm">{packageEntry.name}</Heading>
                    {packageEntry.releaseTrack && <Badge tone="subtle">{packageEntry.releaseTrack}</Badge>}
                    <Text tone="muted">{packageEntry.purpose}</Text>
                  </Stack>
                </Card>
              ))}
            </div>
          </section>
        </Stack>
      );
    }
    ''',
)

# Concise public playground contract; detailed grid docs remain canonical elsewhere.
write(
    "examples/basic-playground/README.md",
    r'''
    # VyrnForge Playground

    This Vite application is VyrnForge's human-facing exploration surface. It shows
    how developers compose the library into real application UI using public package
    APIs.

    ## Purpose

    The playground answers practical consumer questions:

    - What can I build with VyrnForge?
    - Which component or pattern fits this task?
    - What does it look and behave like across themes and densities?
    - Which package and framework consumption path should I use today?
    - Can I edit and copy a working example?
    - What related components, accessibility requirements, and limitations matter?

    Component maturity, package identity, framework support, and reusable pattern
    descriptions come from `docs/generated/consumer-knowledge.json`. That generated
    projection derives from canonical metadata; the playground must not maintain a
    second support or maturity table.

    Human-authored live examples are allowed because they demonstrate composition and
    interaction, but they must use public VyrnForge APIs and remain verified by the
    playground build/browser checks.

    ## Information architecture

    - **Foundations** — shared tokens, themes, density, and styling extension points.
    - **Components** — focused interactive component references and editable examples.
    - **Patterns** — reusable application compositions such as forms, settings,
      resource lists, details, assignments, and application shells.
    - **Advanced Modules** — optional specialized packages such as the independently
      released React data grid.
    - **Internal QA** — stress matrices and torture cases remain addressable for
      engineering tests but are intentionally excluded from normal public navigation.

    The docs application is the source-of-truth / AI-context inspector. AI tools should
    consume the generated task-scoped files under `docs/generated/ai-context/` rather
    than scrape the playground.

    ## Component pages

    `ComponentDemoPage` owns the common component reference layout. `LiveExample`
    evaluates trusted editable JSX examples in a restricted VyrnForge scope. Import
    blocks are read-only; copied code combines the verified import with current example
    source.

    Do not duplicate package component styling in playground CSS. Playground styles
    are limited to documentation layout, preview framing, responsive behavior, and
    editor presentation.

    ## Run

    From the repository root:

    ```bash
    npm run dev:playground
    npm run build:playground
    ```

    Package CSS is consumed in the recommended order: core, components, then optional
    module CSS such as the data grid.
    ''',
)

# AI-facing docs inspector.
write(
    "apps/docs/src/AiContextIndexPage.tsx",
    r'''
    import { Badge, Card, Heading, Stack, Text } from "@vyrnforge/ui-components";
    import aiContextRaw from "../../../docs/generated/ai-context/index.json?raw";

    type AiContextIndex = {
      protocol: Record<string, string>;
      packages: Array<{ name: string; status: string; releaseTrack: string | null; runtime: string | null }>;
      frameworks: Array<{ id: string; supportLevel: string; renderer: string }>;
      categories: Array<{ id: string; context: string }>;
      patterns: Array<{ id: string; name: string; category: string; context: string }>;
      components: Array<{ id: string; name: string; category: string; availability: string; context: string }>;
    };

    const index = JSON.parse(aiContextRaw) as AiContextIndex;

    export function AiContextIndexPage() {
      return (
        <Stack gap="lg">
          <Card padding="lg">
            <Stack gap="md">
              <Badge variant="info">AI bootstrap</Badge>
              <Heading level={3} size="md">Task-scoped retrieval</Heading>
              <Text>
                AI consumers should start with <code>ai-context/index.json</code>, select the smallest relevant pattern, category, or component slice, and only escalate to architecture documents for cross-cutting decisions.
              </Text>
              <pre className="vf-docs-reference-code"><code>{`npm run query:ai-context -- --component button --framework react\nnpm run query:ai-context -- --pattern settings`}</code></pre>
            </Stack>
          </Card>

          <Card padding="lg">
            <Heading level={3} size="md">Retrieval protocol</Heading>
            <div className="vf-docs-contract-details">
              {Object.entries(index.protocol).map(([name, instruction]) => (
                <div className="vf-docs-contract-field" key={name}>
                  <strong>{name}</strong>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <Heading level={3} size="md">Context surface</Heading>
            <div className="vf-docs-reference__grid">
              <Card padding="md"><Heading level={4} size="sm">Categories</Heading><Text>{index.categories.length} discovery slices</Text></Card>
              <Card padding="md"><Heading level={4} size="sm">Patterns</Heading><Text>{index.patterns.length} task-oriented slices</Text></Card>
              <Card padding="md"><Heading level={4} size="sm">Components</Heading><Text>{index.components.length} focused component slices</Text></Card>
              <Card padding="md"><Heading level={4} size="sm">Frameworks</Heading><Text>{index.frameworks.map((entry) => entry.id).join(", ")}</Text></Card>
            </div>
          </Card>

          <Card padding="lg">
            <Heading level={3} size="md">Patterns</Heading>
            <div className="vf-docs-contract-details">
              {index.patterns.map((pattern) => (
                <div className="vf-docs-contract-field" key={pattern.id}>
                  <strong>{pattern.name}</strong>
                  <span><code>{pattern.context}</code></span>
                </div>
              ))}
            </div>
          </Card>
        </Stack>
      );
    }
    ''',
)

# Component reference viewer shares consumer knowledge and exposes direct slice locations.
component_page = ROOT / "apps/docs/src/ComponentReferencePage.tsx"
content = component_page.read_text(encoding="utf-8")
content = content.replace('componentReferenceRaw from "../../../docs/generated/component-reference.json?raw";', 'consumerKnowledgeRaw from "../../../docs/generated/consumer-knowledge.json?raw";')
content = content.replace('type ComponentReference = {\n  components: ComponentReferenceItem[];\n};\n\nconst reference = JSON.parse(componentReferenceRaw) as ComponentReference;', 'type ConsumerKnowledge = {\n  components: ComponentReferenceItem[];\n};\n\nconst reference = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;')
content = content.replace('                    <Text>{component.purpose}</Text>\n', '                    <Text>{component.purpose}</Text>\n                    <Text size="sm" tone="muted">AI context slice: <code>{`ai-context/components/${component.id}.json`}</code></Text>\n')
component_page.write_text(content, encoding="utf-8")

# Docs registry: AI entrypoint plus active forward-looking gates.
registry = ROOT / "apps/docs/src/docsRegistry.ts"
content = registry.read_text(encoding="utf-8")
content = content.replace('import qualityGates from "../../../docs/quality/00-quality-gates.md?raw";', 'import qualityGates from "../../../docs/quality/00-quality-gates.md?raw";\nimport multiFrameworkProgramGates from "../../../docs/quality/multi-framework-program-gates.md?raw";')
content = content.replace('  | "package-reference";', '  | "package-reference"\n  | "ai-context-index";')
start_marker = 'export const docsRoutes: DocsRoute[] = [\n'
ai_route = '''export const docsRoutes: DocsRoute[] = [
  {
    id: "ai-consumer-context",
    title: "AI Consumer Context",
    group: "Start Here",
    description: "Inspect the minimal generated retrieval index used by AI consumers.",
    sourcePath: "docs/generated/ai-context/index.json",
    aiPurpose: "Start here for task-scoped consumer context instead of loading the full documentation corpus.",
    tags: ["ai", "generated", "consumer-context"],
    kind: "ai-context-index",
  },
'''
content = content.replace(start_marker, ai_route)
quality_anchor = '''  {
    id: "known-limitations",'''
program_route = '''  {
    id: "multi-framework-program-gates",
    title: "Multi-Framework Program Gates",
    group: "Quality",
    description: "Active G11-G15 evidence requirements for first-class multi-framework distribution.",
    sourcePath: "docs/quality/multi-framework-program-gates.md",
    aiPurpose: "Use this before claiming Angular, Vue, React convergence, or distribution gates complete.",
    tags: ["canonical", "quality", "multi-framework", "gates"],
    canonical: true,
    content: multiFrameworkProgramGates,
  },
  {
    id: "known-limitations",'''
content = content.replace(quality_anchor, program_route)
content = content.replace('title: "AI Context",', 'title: "AI Bootstrap",')
registry.write_text(content, encoding="utf-8")

replace("apps/docs/src/DocsPage.tsx", 'import { AiContextPage } from "./AiContextPage";', 'import { AiContextPage } from "./AiContextPage";\nimport { AiContextIndexPage } from "./AiContextIndexPage";')
replace("apps/docs/src/DocsPage.tsx", '      {route.kind === "component-reference" ? (', '      {route.kind === "ai-context-index" ? (\n        <AiContextIndexPage />\n      ) : route.kind === "component-reference" ? (')
replace("apps/docs/src/DocsShell.tsx", 'Source-of-truth documentation and AI reference', 'AI context and source-of-truth reference')
replace("apps/docs/src/DocsShell.tsx", 'Markdown files remain canonical. This app is a readable navigation\n                and reference layer.', 'Inspect canonical documentation and generated task-scoped context. AI tools should consume the generated JSON directly.')

# Publish generated machine-readable context as static docs assets.
write(
    "apps/docs/vite.config.ts",
    r'''
    import { cpSync, existsSync, mkdirSync } from "node:fs";
    import path from "node:path";
    import { fileURLToPath } from "node:url";
    import { defineConfig, type Plugin } from "vite";
    import react from "@vitejs/plugin-react";

    declare const process: {
      env: {
        VITE_BASE_PATH?: string;
      };
    };

    const appDirectory = path.dirname(fileURLToPath(import.meta.url));
    const repositoryRoot = path.resolve(appDirectory, "../..");

    function publishConsumerContext(): Plugin {
      return {
        name: "publish-vyrnforge-consumer-context",
        closeBundle() {
          const dist = path.join(appDirectory, "dist");
          mkdirSync(dist, { recursive: true });
          const aiSource = path.join(repositoryRoot, "docs/generated/ai-context");
          if (existsSync(aiSource)) {
            cpSync(aiSource, path.join(dist, "ai-context"), { recursive: true });
          }
          cpSync(
            path.join(repositoryRoot, "docs/generated/consumer-knowledge.json"),
            path.join(dist, "consumer-knowledge.json")
          );
        }
      };
    }

    export default defineConfig(({ mode }) => ({
      base: process.env.VITE_BASE_PATH ?? (mode === "production" ? "/vyrnforge-ui/" : "/"),
      plugins: [react(), publishConsumerContext()],
      server: {
        port: 5174
      }
    }));
    ''',
)

# Point docs index at the generated retrieval surface without duplicating it.
docs_readme = ROOT / "docs/README.md"
docs_text = docs_readme.read_text(encoding="utf-8")
if "generated/ai-context/index.json" not in docs_text:
    docs_text += '''\n## AI consumer context\n\nAI consumers should begin with [`generated/ai-context/index.json`](generated/ai-context/index.json) and retrieve the smallest relevant pattern, category, or component slice. The generated files derive from canonical metadata and are also published by the docs application; they are not a second source of truth.\n'''
docs_readme.write_text(docs_text, encoding="utf-8")
