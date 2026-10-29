import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'layout',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/layout');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const layoutCss = (await readFile(path.join(root, 'packages/web/dist/components/layout/layout.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
    const fixtureCss = 'html { font-size: 16px; } body { margin: 0; padding: 24px; --vf-grid-min-item-size: 9rem; font-family: sans-serif; } #actions { inline-size: 13rem; } #grid { inline-size: 31rem; } #inline { inline-size: 20rem; } #ratio { inline-size: 10rem; background: #ddd; } #field, #fieldset, #radio-group { inline-size: 20rem; } #input-group { inline-size: 20rem; } #input-group > input { flex: 1 1 auto; } button { min-inline-size: 6rem; }';
    await writeFile(path.join(outDir, 'layout.css'), `${tokensCss}\n${layoutCss}\n${fixtureCss}`);

    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./layout.css"><title>L3 composition fixture</title></head><body>${body}${script}</body></html>`;
    const gridItems = '<article id="card-a">A</article><article id="card-b">B</article><article id="card-c">C</article><article id="card-d">D</article>';
    const nativeAdditions = `
<div id="inline" data-vf-inline data-vf-inline-gap="sm" data-vf-inline-align="baseline" data-vf-inline-justify="space-between"><span>Alpha</span><strong>Beta</strong></div>
<div id="ratio" data-vf-aspect-ratio data-vf-aspect-ratio-value="video"></div>
<div id="field" data-vf-field data-vf-field-gap="xs"><label for="email">Email</label><input id="email" type="email" aria-describedby="email-help"><small id="email-help">Work address</small></div>
<fieldset id="fieldset" data-vf-fieldset data-vf-fieldset-gap="sm"><legend>Profile</legend><label for="display-name">Display name</label><input id="display-name"></fieldset>
<div id="input-group" data-vf-input-group><input id="search" aria-label="Search query"><button type="button">Search</button></div>
<fieldset id="radio-group" data-vf-radio-group data-vf-radio-group-gap="sm" data-vf-radio-group-orientation="horizontal"><legend>Plan</legend><label><input id="plan-basic" type="radio" name="plan" value="basic"> Basic</label><label><input id="plan-pro" type="radio" name="plan" value="pro"> Pro</label></fieldset>`;
    const webMarkup = `<main id="container" data-vf-container data-vf-container-size="sm" data-vf-container-gutter="md"><section id="stack" data-vf-stack data-vf-stack-gap="lg" data-vf-stack-align="start" data-vf-stack-justify="start" aria-labelledby="heading"><h1 id="heading">L3 composition fixture</h1><section id="grid" data-vf-grid data-vf-grid-gap="sm">${gridItems}</section><div id="actions" dir="rtl" data-vf-cluster data-vf-cluster-gap="sm" data-vf-cluster-align="center" data-vf-cluster-justify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></div>${nativeAdditions}</section></main>`;
    if (port === 'web') await writeFile(path.join(outDir, 'web.html'), page(webMarkup));

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { AspectRatio, Cluster, Container, Field, Fieldset, Grid, Inline, InputGroup, RadioGroup, Stack } = await import('@vyrnforge/react/layout');
      const cards = ['A', 'B', 'C', 'D'].map((label, index) => createElement('article', { id: `card-${String.fromCharCode(97 + index)}`, key: label }, label));
      const markup = renderToString(createElement(Container, { as: 'main', id: 'container', size: 'sm', gutter: 'md' }, createElement(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start', 'aria-labelledby': 'heading' },
        createElement('h1', { id: 'heading' }, 'L3 composition fixture'),
        createElement(Grid, { as: 'section', id: 'grid', gap: 'sm' }, ...cards),
        createElement(Cluster, { id: 'actions', gap: 'sm', align: 'center', justify: 'space-between', dir: 'rtl' }, createElement('button', { id: 'first', type: 'button' }, 'First'), createElement('button', { id: 'second', type: 'button' }, 'Second'), createElement('button', { id: 'third', type: 'button' }, 'Third')),
        createElement(Inline, { id: 'inline', gap: 'sm', align: 'baseline', justify: 'space-between' }, createElement('span', null, 'Alpha'), createElement('strong', null, 'Beta')),
        createElement(AspectRatio, { id: 'ratio', ratio: 'video' }),
        createElement(Field, { id: 'field', gap: 'xs' }, createElement('label', { htmlFor: 'email' }, 'Email'), createElement('input', { id: 'email', type: 'email', 'aria-describedby': 'email-help' }), createElement('small', { id: 'email-help' }, 'Work address')),
        createElement(Fieldset, { id: 'fieldset', gap: 'sm' }, createElement('legend', null, 'Profile'), createElement('label', { htmlFor: 'display-name' }, 'Display name'), createElement('input', { id: 'display-name' })),
        createElement(InputGroup, { id: 'input-group' }, createElement('input', { id: 'search', 'aria-label': 'Search query' }), createElement('button', { type: 'button' }, 'Search')),
        createElement(RadioGroup, { id: 'radio-group', gap: 'sm', orientation: 'horizontal' }, createElement('legend', null, 'Plan'), createElement('label', null, createElement('input', { id: 'plan-basic', type: 'radio', name: 'plan', value: 'basic' }), ' Basic'), createElement('label', null, createElement('input', { id: 'plan-pro', type: 'radio', name: 'plan', value: 'pro' }), ' Pro'))
      )));
      await writeFile(path.join(outDir, 'react.html'), page(markup));
    }

    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const { AspectRatio, Cluster, Container, Field, Fieldset, Grid, Inline, InputGroup, RadioGroup, Stack } = await import('@vyrnforge/vue/layout');
      const app = createSSRApp({ render: () => h(Container, { as: 'main', id: 'container', size: 'sm', gutter: 'md' }, () => h(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start', 'aria-labelledby': 'heading' }, () => [
        h('h1', { id: 'heading' }, 'L3 composition fixture'),
        h(Grid, { as: 'section', id: 'grid', gap: 'sm' }, () => ['A', 'B', 'C', 'D'].map((label, index) => h('article', { id: `card-${String.fromCharCode(97 + index)}` }, label))),
        h(Cluster, { id: 'actions', gap: 'sm', align: 'center', justify: 'space-between', dir: 'rtl' }, () => [h('button', { id: 'first', type: 'button' }, 'First'), h('button', { id: 'second', type: 'button' }, 'Second'), h('button', { id: 'third', type: 'button' }, 'Third')]),
        h(Inline, { id: 'inline', gap: 'sm', align: 'baseline', justify: 'space-between' }, () => [h('span', 'Alpha'), h('strong', 'Beta')]),
        h(AspectRatio, { id: 'ratio', ratio: 'video' }),
        h(Field, { id: 'field', gap: 'xs' }, () => [h('label', { for: 'email' }, 'Email'), h('input', { id: 'email', type: 'email', 'aria-describedby': 'email-help' }), h('small', { id: 'email-help' }, 'Work address')]),
        h(Fieldset, { id: 'fieldset', gap: 'sm' }, () => [h('legend', 'Profile'), h('label', { for: 'display-name' }, 'Display name'), h('input', { id: 'display-name' })]),
        h(InputGroup, { id: 'input-group' }, () => [h('input', { id: 'search', 'aria-label': 'Search query' }), h('button', { type: 'button' }, 'Search')]),
        h(RadioGroup, { id: 'radio-group', gap: 'sm', orientation: 'horizontal' }, () => [h('legend', 'Plan'), h('label', [h('input', { id: 'plan-basic', type: 'radio', name: 'plan', value: 'basic' }), ' Basic']), h('label', [h('input', { id: 'plan-pro', type: 'radio', name: 'plan', value: 'pro' }), ' Pro'])]),
      ])) });
      const markup = await renderToString(app);
      await writeFile(path.join(outDir, 'vue.html'), page(markup));
    }

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfAspectRatioDirective, VfClusterDirective, VfContainerDirective, VfFieldDirective, VfFieldsetDirective, VfGridDirective, VfInlineDirective, VfInputGroupDirective, VfRadioGroupDirective, VfStackDirective } = await import('@vyrnforge/angular/layout');
      class App {}
      Component({ selector: 'vf-layout-test', standalone: true, imports: [VfAspectRatioDirective, VfClusterDirective, VfContainerDirective, VfFieldDirective, VfFieldsetDirective, VfGridDirective, VfInlineDirective, VfInputGroupDirective, VfRadioGroupDirective, VfStackDirective], template: `<main id="container" vfContainer vfContainerSize="sm" vfContainerGutter="md"><section id="stack" vfStack vfStackGap="lg" vfStackAlign="start" aria-labelledby="heading"><h1 id="heading">L3 composition fixture</h1><section id="grid" vfGrid vfGridGap="sm"><article id="card-a">A</article><article id="card-b">B</article><article id="card-c">C</article><article id="card-d">D</article></section><div id="actions" dir="rtl" vfCluster vfClusterGap="sm" vfClusterAlign="center" vfClusterJustify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></div><div id="inline" vfInline vfInlineGap="sm" vfInlineAlign="baseline" vfInlineJustify="space-between"><span>Alpha</span><strong>Beta</strong></div><div id="ratio" vfAspectRatio="video"></div><div id="field" vfField vfFieldGap="xs"><label for="email">Email</label><input id="email" type="email" aria-describedby="email-help"><small id="email-help">Work address</small></div><fieldset id="fieldset" vfFieldset vfFieldsetGap="sm"><legend>Profile</legend><label for="display-name">Display name</label><input id="display-name"></fieldset><div id="input-group" vfInputGroup><input id="search" aria-label="Search query"><button type="button">Search</button></div><fieldset id="radio-group" vfRadioGroup vfRadioGroupGap="sm" vfRadioGroupOrientation="horizontal"><legend>Plan</legend><label><input id="plan-basic" type="radio" name="plan" value="basic"> Basic</label><label><input id="plan-pro" type="radio" name="plan" value="pro"> Pro</label></fieldset></section></main>` })(App);
      const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><title>L3 composition fixture</title><link rel="stylesheet" href="./layout.css"></head><body><vf-layout-test></vf-layout-test></body></html>' });
      await writeFile(path.join(outDir, 'angular.html'), html);
    }

    if (port === 'elements') {
      const markup = `<main><vf-container id="container" size="sm" gutter="md"><vf-stack id="stack" gap="lg" align="start"><h1 id="heading">L3 composition fixture</h1><vf-grid id="grid" gap="sm">${gridItems}</vf-grid><vf-cluster id="actions" dir="rtl" gap="sm" align="center" justify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></vf-cluster><vf-inline id="inline" gap="sm" align="baseline" justify="space-between"><span>Alpha</span><strong>Beta</strong></vf-inline><vf-aspect-ratio id="ratio" ratio="video"></vf-aspect-ratio><vf-field id="field" gap="xs"><label for="email">Email</label><input id="email" type="email" aria-describedby="email-help"><small id="email-help">Work address</small></vf-field><vf-fieldset id="fieldset" gap="sm" aria-label="Profile"><span slot="legend">Profile</span><label for="display-name">Display name</label><input id="display-name"></vf-fieldset><vf-input-group id="input-group"><input id="search" aria-label="Search query"><button type="button">Search</button></vf-input-group><vf-radio-group id="radio-group" gap="sm" orientation="horizontal" aria-label="Plan"><label><input id="plan-basic" type="radio" name="plan" value="basic"> Basic</label><label><input id="plan-pro" type="radio" name="plan" value="pro"> Pro</label></vf-radio-group></vf-stack></vf-container></main>`;
      await writeFile(path.join(outDir, 'elements.html'), page(markup, '<script type="module" src="./elements.js"></script>'));
      await build({ stdin: { resolveDir: root, sourcefile: 'elements-layout.ts', contents: "import { defineLayoutElements } from '@vyrnforge/elements/layout'; defineLayoutElements();" }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
    }
  },
};
