import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import {
  AppShell,
  AppShellHeader,
  AppShellBody,
  AppShellNavigation,
  AppShellMain,
  AppShellFooter,
} from '@vyrnforge/react/app-shell';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { Link } from '@vyrnforge/react/link';
import {
  SideNav,
  SideNavGroup,
  SideNavGroupLabel,
  SideNavList,
  SideNavItem,
  SideNavLink,
} from '@vyrnforge/react/side-nav';
import { Surface } from '@vyrnforge/react/surface';
import { Text } from '@vyrnforge/react/text';
import { Textarea } from '@vyrnforge/react/textarea';
import { parseInline } from '../../content-model.mjs';
import { buildContentLayoutModel } from '../content-layout.js';
import { parseFragment, textNodeValue } from '../fragment.js';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';
import { liveExampleDocument, loadCompiler, transpileExample } from '../playground';

const storageKey = 'vyrnforge.docs.framework';

const reactAttributeNames = Object.freeze({
  class: 'className',
  for: 'htmlFor',
  autocomplete: 'autoComplete',
  spellcheck: 'spellCheck',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  contenteditable: 'contentEditable',
});

const booleanAttributes = new Set([
  'checked',
  'disabled',
  'hidden',
  'multiple',
  'open',
  'readonly',
  'required',
  'selected',
]);

function reactStyleName(property: string) {
  if (property.startsWith('--')) return property;
  return property
    .replace(/^-ms-/, 'ms-')
    .replace(/^-webkit-/, 'Webkit-')
    .replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

function styleFor(element: HTMLElement) {
  const style: Record<string, string> = {};
  for (const property of element.style) {
    style[reactStyleName(property)] = element.style.getPropertyValue(property).trim();
  }
  return style;
}

function propsFor(element: Element) {
  const props: Record<string, unknown> = {};
  for (const attribute of element.attributes) {
    if (attribute.name === 'style') {
      props.style = styleFor(element as HTMLElement);
      continue;
    }
    const name = reactAttributeNames[attribute.name as keyof typeof reactAttributeNames] || attribute.name;
    props[name] = booleanAttributes.has(attribute.name) ? true : attribute.value;
  }
  return props;
}

function renderLegacyNode(node: Node, key: React.Key): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return textNodeValue(node);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node as Element;
  const props = propsFor(element);
  props.key = key;
  const children = Array.from(element.childNodes).map((child, index) => renderLegacyNode(child, index));
  return React.createElement(element.localName, props, ...children);
}

function renderLegacyFragment(value = '') {
  return parseFragment(value).map((node, index) => renderLegacyNode(node, index));
}

function FrameworkMark({ id, mark }: { id: string; mark: { viewBox: string; path: string } | null }) {
  if (!mark) return null;
  return (
    <svg
      className="vf-framework-mark"
      data-vf-framework-mark={id}
      viewBox={mark.viewBox}
      aria-hidden="true"
      focusable="false"
    >
      <path d={mark.path} />
    </svg>
  );
}

function RichText({ value }: { value: string }) {
  return <>{parseInline(value).map((part, index) => {
    if (part.kind === 'code') return <code key={index}>{part.value}</code>;
    if (part.kind === 'strong') return <Text key={index} as="strong" variant="label-md">{part.value}</Text>;
    return <React.Fragment key={index}>{part.value}</React.Fragment>;
  })}</>;
}

type SearchItem = {
  title: string;
  path: string;
  text: string;
};

function DocsSearch({ siteRoot }: { siteRoot: string }) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const searchIndex = React.useRef<Promise<SearchItem[]> | null>(null);
  const requestId = React.useRef(0);
  const siteRootUrl = React.useMemo(() => new URL(siteRoot || './', window.location.href), [siteRoot]);

  function loadSearchIndex() {
    searchIndex.current ||= fetch(new URL('search-index.json', siteRootUrl)).then((response) => {
      if (!response.ok) throw new Error(`Unable to load docs search index: ${response.status}`);
      return response.json();
    });
    return searchIndex.current;
  }

  async function search(value: string) {
    const currentRequest = ++requestId.current;
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      setResults([]);
      return;
    }
    const index = await loadSearchIndex();
    if (currentRequest !== requestId.current) return;
    setResults(index.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(normalized)).slice(0, 8));
  }

  function updateQuery(value: string) {
    setQuery(value);
    void search(value);
  }

  return (
    <div className="vf-docs-search-wrap" data-vf-docs-search-owner="react">
      <Text as="label" variant="label-md" htmlFor="vf-docs-search">Search</Text>
      <Input
        id="vf-docs-search"
        data-vf-docs-search=""
        type="search"
        autoComplete="off"
        placeholder="Search docs…"
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateQuery(event.currentTarget.value)}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Escape') updateQuery('');
        }}
      />
      <ul className="vf-docs-search-results" data-vf-docs-search-results="" hidden={results.length === 0}>
        {results.map((item) => (
          <li key={`${item.path}-${item.title}`}>
            <Link href={new URL(item.path || './', siteRootUrl).href}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Example({ block, assetRoot }: { block: any; assetRoot: string }) {
  if (block.type === 'example-unavailable') {
    return (
      <Surface as="section" className="vf-example--unavailable" data-vf-example-unavailable={block.id}>
        <Text as="h3" variant="heading-sm">{block.title}</Text>
        <Text as="p" variant="body-md">This executable example is not available for the selected framework in this documentation channel.</Text>
      </Surface>
    );
  }

  const data = block.data;
  const config = data.frameworks?.[block.framework];
  if (!config) throw new Error(`React documentation example ${block.id} is missing ${block.framework} configuration`);

  const assetRootUrl = React.useMemo(() => new URL(assetRoot || './', window.location.href), [assetRoot]);
  const previewUrl = React.useMemo(() => new URL(config.preview, assetRootUrl).href, [assetRootUrl, config.preview]);
  const [expanded, setExpanded] = React.useState(false);
  const [source, setSource] = React.useState(config.source);
  const [running, setRunning] = React.useState(false);
  const [status, setStatus] = React.useState(`${block.framework} example ready.`);
  const [frameSource, setFrameSource] = React.useState<{ src?: string; srcDoc?: string }>({ src: previewUrl });
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    function receiveExampleResult(event: MessageEvent) {
      const message = event.data;
      if (!message || message.type !== 'vf-example-result' || message.id !== block.id) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      setStatus(message.status === 'ready' ? 'Live preview updated.' : `Runtime error: ${message.message || 'Unknown error'}`);
    }
    window.addEventListener('message', receiveExampleResult);
    return () => window.removeEventListener('message', receiveExampleResult);
  }, [block.id]);

  function resetExample() {
    setSource(config.source);
    setFrameSource({ src: previewUrl });
    setStatus(`${block.framework} example ready.`);
  }

  async function runExample() {
    setRunning(true);
    setStatus('Compiling example…');
    try {
      const ts = await loadCompiler(new URL(data.compiler, assetRootUrl).href);
      const code = transpileExample(source, config, ts);
      const documentSource = liveExampleDocument({
        id: data.id,
        framework: block.framework,
        code,
        runtimeUrl: config.runtime ? new URL(config.runtime, assetRootUrl).href : '',
        stylesUrl: new URL(data.styles, assetRootUrl).href,
        frameCssUrl: new URL(data.frameCss, assetRootUrl).href,
      });
      setFrameSource({ srcDoc: documentSource });
      setStatus('Running example…');
    } catch (error) {
      setStatus(`Unable to run: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <Surface
      as="section"
      className="vf-example"
      data-vf-example-id={block.id}
      data-vf-example-default-framework={block.framework}
      data-vf-example-locked-framework={block.framework}
      data-vf-example-owner="react"
    >
      <header className="vf-example__header">
        <div>
          <Text as="h3" variant="heading-sm">{block.title}</Text>
          {block.description ? <Text as="p" variant="body-md">{block.description}</Text> : null}
        </div>
        <Text as="span" variant="label-md" className="vf-example__framework">{block.framework}</Text>
      </header>
      <div className="vf-example__preview">
        <iframe
          ref={frameRef}
          data-vf-example-frame=""
          title={`${block.title} preview`}
          sandbox="allow-scripts"
          src={frameSource.src}
          srcDoc={frameSource.srcDoc}
        />
      </div>
      <div className="vf-example__controls">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-vf-example-code-toggle=""
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Hide code' : 'Show code'}
        </Button>
      </div>
      <div className="vf-example__editor" data-vf-example-editor="" hidden={!expanded}>
        <div className="vf-example__editor-toolbar">
          <Text as="strong" variant="label-md">Editable source</Text>
          <span data-vf-example-language="">{String(config.language || '').toUpperCase()}</span>
          <span className="vf-example__editor-actions">
            <Button type="button" variant="primary" size="sm" data-vf-example-run="" disabled={running} onClick={() => void runExample()}>Run</Button>
            <Button type="button" variant="secondary" size="sm" data-vf-example-reset="" onClick={resetExample}>Reset</Button>
          </span>
        </div>
        <Textarea
          data-vf-example-source=""
          spellCheck={false}
          aria-label={`${block.title} code editor`}
          value={source}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setSource(event.currentTarget.value)}
        />
        <Text as="p" variant="body-sm" className="vf-example__status" data-vf-example-status="" aria-live="polite">{status}</Text>
      </div>
    </Surface>
  );
}

function ContentBlock({ block, framework, assetRoot }: { block: any; framework: string; assetRoot: string }) {
  if (block.type === 'paragraph') {
    return <Text as="p" variant="body-md"><RichText value={block.text} /></Text>;
  }
  if (block.type === 'heading') {
    const as = `h${Math.min(6, Math.max(3, Number(block.level) || 3))}` as any;
    return <Text as={as} id={block.id} variant="heading-sm"><RichText value={block.text} /></Text>;
  }
  if (block.type === 'code') {
    return (
      <pre tabIndex={0} {...(block.frameworkUsage ? { 'data-vf-framework-usage-code': framework } : {})}>
        <code className={`language-${block.language || 'text'}`}>{block.value || ''}</code>
      </pre>
    );
  }
  if (block.type === 'split') {
    return (
      <div className="vf-docs-split">
        {(block.items || []).map((item: any) => (
          <Surface as="article" key={item.title} className={`vf-docs-card vf-docs-card--${item.tone || 'neutral'}`}>
            <Text as="h3" variant="heading-sm">{item.title}</Text>
            <Text as="p" variant="body-md"><RichText value={item.text} /></Text>
          </Surface>
        ))}
      </div>
    );
  }
  if (block.type === 'example' || block.type === 'example-unavailable') return <Example block={block} assetRoot={assetRoot} />;
  if (block.type === 'list') {
    return <ul>{(block.items || []).map((item: string, index: number) => <li key={index}><RichText value={item} /></li>)}</ul>;
  }
  if (block.type === 'note') {
    return <Surface as="aside" className="vf-docs-note"><RichText value={block.text} /></Surface>;
  }
  if (block.type === 'table') {
    return (
      <Surface as="div" className="vf-docs-table-wrap" tabIndex={0} role="region" aria-label={block.label || 'Reference table'}>
        <table>
          <thead><tr>{(block.columns || []).map((column: string) => <th key={column}><RichText value={column} /></th>)}</tr></thead>
          <tbody>
            {(block.rows || []).map((row: string[], rowIndex: number) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => cellIndex === 0
                ? <th key={cellIndex} scope="row"><RichText value={cell} /></th>
                : <td key={cellIndex}><RichText value={cell} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </Surface>
    );
  }
  throw new Error(`Unsupported React documentation content block: ${block.type}`);
}

function ModelContent({
  content,
  navigation,
  homeHref,
  assetRoot,
}: {
  content: any;
  navigation: any[];
  homeHref: string;
  assetRoot: string;
}) {
  const layout = buildContentLayoutModel(content, navigation, homeHref);
  const resolved = layout.content;
  const context = resolved.context;
  return (
    <div className="vf-docs-content-layout">
      <article className="vf-docs-article">
        <nav className="vf-docs-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            {layout.breadcrumbs.map((item: any, index: number) => (
              <li key={`${item.label}-${index}`} aria-current={item.current ? 'page' : undefined}>
                {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
              </li>
            ))}
          </ol>
        </nav>
        <Text as="h1" variant="heading-lg">{resolved.pageTitle}</Text>
        {context ? (
          <div className="vf-docs-framework-context" data-vf-framework-context={context.framework}>
            <Text as="strong" variant="label-md">
              <FrameworkMark id={context.framework} mark={context.mark} />
              <span>{context.label}</span>
            </Text>
            <span>{context.entrypoint ? <>Public entrypoint: <code>{context.entrypoint}</code></> : 'Framework-specific documentation view'}</span>
          </div>
        ) : null}
        <Text as="p" variant="body-lg" className="vf-docs-lede"><RichText value={resolved.lede} /></Text>
        {resolved.meta?.length ? (
          <div className="vf-docs-page-meta" aria-label={`${resolved.pageTitle} characteristics`}>
            {resolved.meta.map((item: string) => <Text as="span" variant="label-md" key={item}>{item}</Text>)}
          </div>
        ) : null}
        {(resolved.sections || []).map((section: any) => (
          <section key={`${section.adaptation || 'shared'}-${section.title}`} data-vf-framework-adaptation={section.adaptation || undefined}>
            <Text as="h2" id={section.id} variant="heading-md">{section.title}</Text>
            {(section.blocks || []).map((block: any, index: number) => (
              <ContentBlock key={`${block.type}-${index}`} block={block} framework={resolved.framework} assetRoot={assetRoot} />
            ))}
          </section>
        ))}
      </article>
      {layout.headings.length ? (
        <aside className="vf-docs-toc">
          <Text as="strong" variant="label-md">On this page</Text>
          <nav aria-label="On this page">
            <ul>
              {layout.headings.map((heading: any) => (
                <li key={heading.id} data-vf-toc-level={String(heading.level)}>
                  <Link href={`#${heading.id}`}>{heading.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : null}
    </div>
  );
}

function renderNavItem(item: any, key: React.Key) {
  return (
    <SideNavItem key={key}>
      <SideNavLink href={item.href} current={item.current}>{item.title}</SideNavLink>
    </SideNavItem>
  );
}

function renderNavGroup(group: any) {
  const body = group.subgroups?.length
    ? group.subgroups.map((subgroup: any) => (
        <details
          key={subgroup.label}
          className="vf-docs-component-subgroup"
          data-vf-docs-component-subgroup=""
          data-vf-current-group={subgroup.open ? 'true' : undefined}
          open={subgroup.open || undefined}
        >
          <summary className="vf-docs-component-subgroup__label">
            <span>{subgroup.label}</span>
            <span className="vf-docs-component-subgroup__count" aria-hidden="true">{String(subgroup.count)}</span>
          </summary>
          <SideNavList>{subgroup.items.map((item: any, index: number) => renderNavItem(item, index))}</SideNavList>
        </details>
      ))
    : [<SideNavList key={`${group.label}-list`}>{group.items.map((item: any, index: number) => renderNavItem(item, index))}</SideNavList>];

  return (
    <SideNavGroup key={group.label}>
      <SideNavGroupLabel>{group.label}</SideNavGroupLabel>
      {body}
    </SideNavGroup>
  );
}

function renderFrameworkSwitcher(model: any) {
  return (
    <nav className="vf-docs-framework-switcher" aria-label="Framework">
      <ul className="vf-docs-framework-switcher__list">
        {model.frameworkChoices.map((choice: any) => (
          <li key={choice.id}>
            <Link
              href={choice.href}
              className="vf-docs-framework-switcher__link"
              data-vf-framework-choice={choice.id}
              data-vf-framework-current={choice.current ? 'true' : undefined}
              aria-current={choice.current ? 'page' : undefined}
              aria-label={`${choice.label} documentation`}
              title={choice.label}
            >
              <FrameworkMark id={choice.id} mark={choice.mark} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Header({ model }: { model: any }) {
  return (
    <div className="vf-docs-header__inner">
      <Link className="vf-docs-brand" href={model.brandHref}>VyrnForge</Link>
      <Text as="span" variant="label-md" className="vf-docs-version" data-vf-docs-version="">{model.versionText}</Text>
      <div className="vf-docs-tools">
        {model.clientOwner === 'react' ? (
          <DocsSearch siteRoot={model.siteRoot || model.brandHref} />
        ) : (
          <div className="vf-docs-search-wrap">
            <Text as="label" variant="label-md" htmlFor="vf-docs-search">Search</Text>
            <Input id="vf-docs-search" data-vf-docs-search="" type="search" autoComplete="off" />
            <ul className="vf-docs-search-results" data-vf-docs-search-results="" hidden />
          </div>
        )}
        {renderFrameworkSwitcher(model)}
      </div>
    </div>
  );
}

function DocsApp({ model }: { model: any }) {
  React.useEffect(() => {
    window.localStorage.setItem(storageKey, 'react');
    if (model.clientOwner === 'react') document.documentElement.dataset.vfDocsReady = 'true';
  }, [model.clientOwner]);

  return (
    <AppShell data-vf-docs-renderer="react" data-vf-docs-client-owner={model.clientOwner || undefined}>
      <Link className="vf-skip-link" href="#main">Skip to content</Link>
      <AppShellHeader className="vf-docs-header"><Header model={model} /></AppShellHeader>
      <AppShellBody>
        <AppShellNavigation className="vf-docs-navigation">
          <SideNav aria-label="Documentation">{model.navigation.map(renderNavGroup)}</SideNav>
        </AppShellNavigation>
        <AppShellMain id="main">
          {model.mainContent
            ? <ModelContent content={model.mainContent} navigation={model.navigation} homeHref={model.brandHref} assetRoot={model.assetRoot || './'} />
            : renderLegacyFragment(model.mainHtml || '')}
        </AppShellMain>
      </AppShellBody>
      <AppShellFooter className="vf-docs-footer">
        <Text as="span" variant="body-sm">{model.footerText || ''}</Text>
      </AppShellFooter>
    </AppShell>
  );
}

const model = readDocsPageModel();
const root = createRoot(document.querySelector('#vf-docs-app')!);

flushSync(() => {
  root.render(<DocsApp model={model} />);
});

markDocsRendered('react');