const webTabs = `
<div id="web-tabs" data-vf-tabs-root data-vf-orientation="horizontal" data-vf-activation="automatic">
  <div role="tablist" aria-label="Account sections" aria-orientation="horizontal" data-vf-tabs-list data-vf-orientation="horizontal">
    <button id="web-tabs-tab-overview" type="button" role="tab" tabindex="0" aria-selected="true" aria-controls="web-tabs-panel-overview" data-vf-tabs-tab data-vf-value="overview" data-vf-selected>Overview</button>
    <button id="web-tabs-tab-billing" type="button" role="tab" tabindex="-1" aria-selected="false" aria-disabled="true" disabled aria-controls="web-tabs-panel-billing" data-vf-tabs-tab data-vf-value="billing" data-vf-disabled>Billing</button>
    <button id="web-tabs-tab-security" type="button" role="tab" tabindex="-1" aria-selected="false" aria-controls="web-tabs-panel-security" data-vf-tabs-tab data-vf-value="security">Security</button>
  </div>
  <div id="web-tabs-panel-overview" role="tabpanel" tabindex="0" aria-labelledby="web-tabs-tab-overview" data-vf-tabs-panel data-vf-selected>Overview panel</div>
  <div id="web-tabs-panel-billing" role="tabpanel" tabindex="0" aria-labelledby="web-tabs-tab-billing" data-vf-tabs-panel hidden>Billing panel</div>
  <div id="web-tabs-panel-security" role="tabpanel" tabindex="0" aria-labelledby="web-tabs-tab-security" data-vf-tabs-panel hidden>Security panel</div>
</div>`;

export const browserFixture = {
  component: 'tabs',
  title: 'Tabs fixture',
  heading: 'Tabs browser fixture',
  ports: {
    web: { body: webTabs },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-tabs-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory({ client }) {
  const { createElement, Fragment } = await import('react');
  const { TabsList, TabsPanel, TabsRoot, TabsTab } = await import('@vyrnforge/react/tabs');

  const tabs = (id, options = {}) => createElement(
    TabsRoot,
    { id, defaultValue: 'overview', ...options.root },
    createElement(
      TabsList,
      { 'aria-label': options.label ?? 'Account sections' },
      createElement(TabsTab, { value: 'overview' }, 'Overview'),
      createElement(TabsTab, { value: 'billing', disabled: true }, 'Billing'),
      createElement(TabsTab, { value: 'security' }, 'Security'),
      ...(options.activity === false
        ? []
        : [createElement(TabsTab, { key: 'activity', value: 'activity' }, 'Activity')]),
    ),
    createElement(TabsPanel, { value: 'overview' }, 'Overview panel'),
    createElement(TabsPanel, { value: 'billing' }, 'Billing panel'),
    createElement(TabsPanel, { value: 'security' }, 'Security panel'),
    ...(options.activity === false
      ? []
      : [createElement(TabsPanel, { key: 'activity-panel', value: 'activity' }, 'Activity panel')]),
  );

  return createElement(
    Fragment,
    null,
    tabs('react-tabs', {
      root: {
        dir: 'rtl',
        onValueChange: client ? (value) => { document.body.dataset.value = value; } : () => undefined,
      },
    }),
    tabs('react-manual-tabs', {
      activity: false,
      label: 'Manual vertical sections',
      root: {
        orientation: 'vertical',
        activation: 'manual',
        onValueChange: client
          ? (value) => { document.body.dataset.manualValue = value; }
          : () => undefined,
      },
    }),
  );
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
  const { TabsList, TabsPanel, TabsRoot, TabsTab } = await import('@vyrnforge/vue/tabs');

  const tabs = (id, options = {}) => h(
    TabsRoot,
    { id, defaultValue: 'overview', ...options.root },
    () => [
      h(
        TabsList,
        { 'aria-label': options.label ?? 'Account sections' },
        () => [
          h(TabsTab, { value: 'overview' }, () => 'Overview'),
          h(TabsTab, { value: 'billing', disabled: true }, () => 'Billing'),
          h(TabsTab, { value: 'security' }, () => 'Security'),
          ...(options.activity === false ? [] : [h(TabsTab, { value: 'activity' }, () => 'Activity')]),
        ],
      ),
      h(TabsPanel, { value: 'overview' }, () => 'Overview panel'),
      h(TabsPanel, { value: 'billing' }, () => 'Billing panel'),
      h(TabsPanel, { value: 'security' }, () => 'Security panel'),
      ...(options.activity === false ? [] : [h(TabsPanel, { value: 'activity' }, () => 'Activity panel')]),
    ],
  );

  return createSSRApp({
    render: () => h('div', [
      tabs('vue-tabs', {
        root: {
          dir: 'rtl',
          onValueChange: client ? (value) => { document.body.dataset.value = value; } : () => undefined,
        },
      }),
      tabs('vue-manual-tabs', {
        activity: false,
        label: 'Manual vertical sections',
        root: {
          orientation: 'vertical',
          activation: 'manual',
          onValueChange: client
            ? (value) => { document.body.dataset.manualValue = value; }
            : () => undefined,
        },
      }),
    ]),
  });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const {
    VfTabsListDirective,
    VfTabsPanelDirective,
    VfTabsRootDirective,
    VfTabsTabDirective,
  } = await import('@vyrnforge/angular/tabs');

  const template = '<div vfTabsRoot id="angular-tabs" defaultValue="overview" dir="rtl" (valueChange)="changed($event)"><div vfTabsList aria-label="Account sections"><button vfTabsTab="overview">Overview</button><button vfTabsTab="billing" disabled>Billing</button><button vfTabsTab="security">Security</button><button vfTabsTab="activity">Activity</button></div><div vfTabsPanel="overview">Overview panel</div><div vfTabsPanel="billing">Billing panel</div><div vfTabsPanel="security">Security panel</div><div vfTabsPanel="activity">Activity panel</div></div><div vfTabsRoot id="angular-manual-tabs" defaultValue="overview" orientation="vertical" activation="manual" (valueChange)="manualChanged($event)"><div vfTabsList aria-label="Manual vertical sections"><button vfTabsTab="overview">Overview</button><button vfTabsTab="billing" disabled>Billing</button><button vfTabsTab="security">Security</button></div><div vfTabsPanel="overview">Overview panel</div><div vfTabsPanel="billing">Billing panel</div><div vfTabsPanel="security">Security panel</div></div>';

  class TabsTestApp {
    changed(value) {
      if (client) document.body.dataset.value = value;
    }

    manualChanged(value) {
      if (client) document.body.dataset.manualValue = value;
    }
  }

  Component({
    selector: 'vf-tabs-test',
    standalone: true,
    imports: [VfTabsRootDirective, VfTabsListDirective, VfTabsTabDirective, VfTabsPanelDirective],
    template,
  })(TabsTestApp);

  return TabsTestApp;
}

export async function createElementsStory({ client }) {
  const automatic = `
<vf-tabs id="elements-tabs" default-value="overview" dir="rtl">
  <div data-vf-tabs-list aria-label="Account sections">
    <button data-vf-tabs-tab data-vf-value="overview">Overview</button>
    <button data-vf-tabs-tab data-vf-value="billing" disabled>Billing</button>
    <button data-vf-tabs-tab data-vf-value="security">Security</button>
    <button data-vf-tabs-tab data-vf-value="activity">Activity</button>
  </div>
  <div data-vf-tabs-panel data-vf-value="overview">Overview panel</div>
  <div data-vf-tabs-panel data-vf-value="billing">Billing panel</div>
  <div data-vf-tabs-panel data-vf-value="security">Security panel</div>
  <div data-vf-tabs-panel data-vf-value="activity">Activity panel</div>
</vf-tabs>`;
  const manual = `
<vf-tabs id="elements-manual-tabs" default-value="overview" orientation="vertical" activation="manual">
  <div data-vf-tabs-list aria-label="Manual vertical sections">
    <button data-vf-tabs-tab data-vf-value="overview">Overview</button>
    <button data-vf-tabs-tab data-vf-value="billing" disabled>Billing</button>
    <button data-vf-tabs-tab data-vf-value="security">Security</button>
  </div>
  <div data-vf-tabs-panel data-vf-value="overview">Overview panel</div>
  <div data-vf-tabs-panel data-vf-value="billing">Billing panel</div>
  <div data-vf-tabs-panel data-vf-value="security">Security panel</div>
</vf-tabs>`;

  return {
    body: `${automatic}${manual}`,
    activate: client
      ? async () => {
          const { defineTabsElement } = await import('@vyrnforge/elements/tabs');
          defineTabsElement();
          document.querySelector('#elements-tabs').addEventListener('vf-value-change', (event) => {
            document.body.dataset.value = event.detail.value;
          });
          document.querySelector('#elements-manual-tabs').addEventListener('vf-value-change', (event) => {
            document.body.dataset.manualValue = event.detail.value;
          });
        }
      : undefined,
  };
}
